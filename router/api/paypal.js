const  paypalControllers = require('../../controllers/paypal')
const router = require('express').Router()




router.post('/create-payment/',paypalControllers.createPaypalPayment)
router.post('/execute-payment/',paypalControllers.executePaypalPayment)


module.exports = router