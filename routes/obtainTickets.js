const router = require('express').Router()

const axios = require('axios')

router.get('/', async (req, res) => {
    if (req.query.devEmail) {

        let response = await axios.get(`${process.env.IBM_FUNCTION_URL}?devEmail=${req.query.devEmail}`)
        res.status(200).send(response.data)
    } else {
        res.status(400).send({'Error':'No developer email was proportionated'})
    }
})

module.exports = router