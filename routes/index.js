const router = require('express').Router()

const receiveSnapshotRouter = require('./receiveSnapshot')
const obtainTicketsRouter = require('./obtainTickets')

router.use('/snapshotReceive',receiveSnapshotRouter)
router.use('/obtainTicket',obtainTicketsRouter)

router.get('/',(req,res)=>{
    res.status(200).send({"Message":"Initial Get"})
})

module.exports = router