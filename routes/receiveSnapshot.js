const router = require('express').Router()

const globby = require('globby')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

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
    upload(req,res,(err)=>{
        if(err) res.status(400).send('Something went wrong')
        console.log(req.file.path);
         fs.unlinkSync(req.file.path) // elimina 
        res.send(req.file)
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