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
        
        //check that the provided ticket id exists
        try {
            let result = await axios.get(process.env.API_GATEWAY_URL+'/conseguirticketid?id='+req.body.ticket_id)

            if(result.data[0].id == req.body.ticket_id){
                //obtain a S3 presignedUrl to save the zip file there
                let preSignedUrl = await axios.get(process.env.API_GATEWAY_URL+'/s3url?fileName='+req.file.filename)
                //store the file in S3
                let resultS3 = await axios.put(preSignedUrl.data, req.file.path)
                // console.log(preSignedUrl.data);

                //split the preSignedUrl.data to obtain the initial url address that contains the bucket name
                let bucketLocation = preSignedUrl.data.split('.com')[0]
                //Create the S3 url of the stored object
                let S3url = `${bucketLocation}.com/${req.file.filename}`
                //update the ticket with the new attached files, a ticket must be passed, but only with the id and the parameters to update
                let ticketToUpdate = {
                    "ticket": {
                        "id": req.body.ticket_id,
                        "summary": "",
                        "email": "",
                        "date": "",
                        "description": "",
                        "assignedDev2": "",
                        "assignedDev3": "",
                        "attachedFiles": S3url
                    }
                }
                let updatedTicket = await axios.put(process.env.API_GATEWAY_URL+'/updateticket',ticketToUpdate)

                // console.log(result);
                fs.unlinkSync(req.file.path) // delete file
                if(resultS3.status != 200){
                    res.status(400).send({'Error':'Error while uploading file to S3 bucket'})
                }
                else{
                    res.status(200).send({
                    'ticketStatus':`Attached files for ticket:${req.body.ticket_id} uploaded to ${updatedTicket.data.attachedFiles}`
                    })
                }


            } else {
                fs.unlinkSync(req.file.path) // delete file
                res.status(400).send({'Error':'Provided ticket id does not exist'})    
            }
            
        } catch (error) {
            // console.log(error.data);
            fs.unlinkSync(req.file.path) // delete file
            res.status(400).send({'Error':'Provided ticket id does not exist'})
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