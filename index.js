const {app,PORT} = require('./app')

app.listen((process.env.PORT || PORT),()=>{console.log(`Server on port ${PORT}`)})