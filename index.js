const cfenv = require('cfenv')
const {app,PORT} = require('./app')

const appEnv = cfenv.getAppEnv()

app.listen(appEnv.port,appEnv.bind,()=>{console.log(`Server on ${appEnv.url}`)})