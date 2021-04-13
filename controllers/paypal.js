require('dotenv').config()
const { default: axios } = require('axios');
const request = require('request')
const Order = require('../models/Order')
const MailService = require('../mailService')
const {makeErrorResponse,validateOrderDetails} = require('../utils/utils')



exports.createPaypalPayment = async (req,res,next) => {
     try {
      const checkoutForm = await JSON.parse(req.body.orderDetails)
      const validation_test = validateOrderDetails(checkoutForm)
      if(Object.keys(validation_test).length > 0 ) {
        let error_message = makeErrorResponse(validation_test)
        return res.status(500).json(validation_test);
      }
      const order_details = await Order.findOne({_id:req.body.orderId,to:req.session.user._id,product:req.body.productId})
      if(!order_details) throw new Error('Failed transaction')
      const amount = order_details.price 
      const currency = order_details.currency.iso 
      request.post(process.env.PAYPAL_API + '/v1/payments/payment',
    {
      auth:
      {
        user: process.env.PAYPAL_CLIENT,
        pass: process.env.PAYPAL_SECRET
      },
      body:
      {
        intent: 'sale',
        payer:
        {
          payment_method: 'paypal'
        },
        transactions: [
        {
          amount:
          {
            total: amount,
            currency: currency
          }
        }],
        redirect_urls:
        {
          return_url: 'http://localhost:8000/',
          cancel_url: 'http://localhost:8000/'
        }
      },
      json: true
    }, function(err, response)
    {
      if (err)
      {
        console.error(err);
        return res.sendStatus(500);
      }
      // 3. Return the payment ID to the client
      res.json(
      {
        id: response.body.id
      });
    });
  } catch (error) {
    console.log(error)
    req.session.setError = true 
    res.redirect('/dashboard/orders?orderError=Order was not completed')
  }
}


exports.executePaypalPayment = async (req,res,next) => {
    var paymentID = req.body.paymentID;
    var payerID = req.body.payerID;
    try {
      const checkoutForm = await JSON.parse(req.body.orderDetails)
      const validation_test = validateOrderDetails(checkoutForm)
      if(Object.keys(validation_test).length > 0 ) {
        let error_message = makeErrorResponse(validation_test)
        return res.status(500).json(validation_test);
      }
      const order_details = await Order.findOne({_id:req.body.orderId,to:req.session.user._id,product:req.body.productId}).populate('product','end_price name description currency images')
      
      if(!order_details) throw new Error('Failed transaction')
      const amount = order_details.price 
      const currency = order_details.currency.iso 
      request.post(process.env.PAYPAL_API + '/v1/payments/payment/' + paymentID +
      '/execute',
      {
        auth:
        {
          user: process.env.PAYPAL_CLIENT,
          pass: process.env.PAYPAL_SECRET
        },
        body:
        {
          payer_id: payerID,
          transactions: [
          {
            amount:
            {
              total: amount,
              currency: currency
            }
          }]
        },
        json: true
      },
      async function(err, response)
      {
        if (err)
        {
          console.error(err);
          return res.sendStatus(500);
        }
        order_details.status = 'completed'
        order_details.address1 = checkoutForm.address1
        order_details.address2 = checkoutForm.adddress2
        order_details.city = checkoutForm.city 
        order_details.country = checkoutForm.country 
        order_details.comments = checkoutForm.comments
        order_details.phone = checkoutForm.phone 
        order_details.mobile = checkoutForm.mobile 
        order_details.zip = checkoutForm.zip
        order_details.name = checkoutForm.name 
        order_details.last_name = checkoutForm.last_name 
        order_details.email = checkoutForm.email
        order_details.paymentMethod = 'paypal'
        await order_details.save()
        const mail = new MailService()
        await mail.sendPurchaseMail(req.session.user,order_details.product,order_details)
        res.json(
        {
          status: 'success'
        });
    });
    } catch (error) {
      console.log(error)
      req.session.setError = true 
      res.redirect('/dashboard/orders?orderError=Order was not completed')
    }
    
}