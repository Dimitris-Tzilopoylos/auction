const app = require('./app')
const http = require('http').createServer(app)
module.exports = http;
const ejs = require('ejs')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const localCaching = require('./middleware/localCaching')
const generalErrorHandler = require('./middleware/generalErrorHandler')
const authCoreRoutes = require('./router/core/login')
const dashboardCoreRoutes = require('./router/core/dashboard')
const errorCoreRoutes = require('./router/core/errors')
const shopCoreRoutes = require('./router/core/shop')
const messageRoutes = require('./router/core/messages')
const paypalRoutes = require('./router/api/paypal')
const sessionRedis = require('./redis')


/// &&&& CRONJOBS
const automatedOrderCreation = require('./cronjobs/automatedOrderCreation')
 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))


app.use(sessionRedis)

app.use(localCaching)
app.use(shopCoreRoutes)
app.use(authCoreRoutes)
app.use(dashboardCoreRoutes)
app.use(messageRoutes)
app.use("/paypal",paypalRoutes)
app.use(errorCoreRoutes)

app.use("*",(req,res,next)=>{
    res.render('errors/404')
})

app.use(generalErrorHandler)
 
mongoose.connect(process.env.DB,{
    useCreateIndex:false,
    useFindAndModify:false,
    useUnifiedTopology:true,
    useNewUrlParser:true 
}).then(()=>{
const socketIO = require('./io')
app.set('io',socketIO)
http.listen(process.env.PORT || 8000,()=>console.log('Running')) 
}).catch(error=>{
    console.log(error)
})
