const router = require('express').Router()

const globby = require('globby')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { default: axios } = require('axios')

const storage = multer.diskStorage({
    destination: path.join(__dirname,'../public'),
    filename: (req,file,cb)=>{
        // cb(null, file.originalname+ new Date().toISOString() +path.extname(file.originalname))
        cb(null,file.originalname)
    }
})

  //file filter that only accepts zips
  const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'application/zip'){
        cb(null,true)
    }else{
        cb(null,false) // ignore other files
    }
}

    //create instance of multer
    const uploadFile = multer({
        storage,
        // limits: {fileSize:1000000},
        fileFilter
    })


    // const upload = multer({storage:storage}).single("file_sent")
    const upload = multer({storage:storage,fileFilter:fileFilter}).single("snapshot_data")



router.post('/',(req,res)=>{
    upload(req,res,async (err)=>{
        if(err) res.status(400).send('Something went wrong')
        //obtain a S3 presignedUrl to save the zip file there
        let preSignedUrl = await axios.get(process.env.S3_PRESIGN_API_GATEWAY_URL+'?fileName='+req.file.filename)
        // console.log(preSignedUrl.data);
        //store the file in S3
        let result = await axios.put(preSignedUrl.data, req.file.path)
        fs.unlinkSync(req.file.path) // delete file
        if(result.status != 200){
            res.status(400).send({'Error':'Error while uploading file to S3 bucket'})
        }
        else{
            res.status(200).send({'Sucess':'File uploaded to S3 bucket'})
        }
    })
})

//shows all of the stored files in /public
router.get('/', async (req,res)=>{
    const files = await globby(['**/public/*'])
    // console.log(files);
    const filesRenamed = files.map(function(x){
        return x.replace("public/",'')
    })
    // res.send(filesRenamed)
    res.send({files:filesRenamed})
})

module.exports = router