const router = require('express').Router()

const receiveSnapshotRouter = require('./receiveSnapshot')

router.use('/snapshotReceive',receiveSnapshotRouter)

router.get('/',(req,res)=>{
    res.status(200).send({"Message":"Initial Get"})
})

module.exports = router