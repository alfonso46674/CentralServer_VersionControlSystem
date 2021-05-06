const router = require('express').Router()


router.get('/',(req,res)=>{
    res.status(200).send({"Message":"Initial Get"})
})

module.exports = router