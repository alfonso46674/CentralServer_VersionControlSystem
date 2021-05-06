const express = require('express')
const cors = require('cors')

const app = express()

const PORT = 8080

//importar rutas a usar
const router = require('./routes')

const {json,urlencoded} = express
app.use(json())
app.use(urlencoded({ extended: false }))
const corsOptions = {origin: '*', optionsSuccessStatus:200}
app.use(cors(corsOptions))

app.use(router)

app.listen(PORT,()=>{console.log(`Server on port ${PORT}`)})