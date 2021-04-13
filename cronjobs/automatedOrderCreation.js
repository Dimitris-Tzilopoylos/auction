const cron = require('node-cron')
const Product = require('../models/Product')
const Bid = require('../models/Bid')
const Order = require('../models/Order')
const User = require('../models/User')
const MailService = require('../mailService')
const app = require('../app')
// bid_end_date:{$lt:new Date().toISOString()} end_price:{$gt:0},last_bid:{$ne:null}}
let execution_flag = true
let completion_counter = 0
let order;
let b
const _from = "605f7e54049ff92da00097b7"
const allowedPaymentMethods = ['bank','paypal','cod','visa','bitcoin']
module.exports = cron.schedule("*/59 * * * * *", async function() {
    try {
        if(execution_flag){
            execution_flag = false
            const products = await Product.find({status:{$ne:'SOLD'},bid_end_date:{$lt:new Date().toISOString()},end_price:{$gt:0},last_bid:{$ne:null}}).populate('last_bid')
 
            if(!products) throw new Error('')
            for(let p of products) {
                b = await Bid.findOne({product:p._id,_id:p.last_bid._id,user:p.last_bid.user}) 
 
                if(b) {
                    p.status="SOLD"
                    p.sold = { 
                        user:p.last_bid.user,
                        price:p.last_bid.price,
                        currency: {...p.last_bid.currency},
                    }
                    order = new Order({
                        product:p._id,
                        from:_from,
                        to:p.sold.user,
                        paymentMethod:'bank',
                        price:p.sold.price,
                        currency:p.sold.currency,
                        title:'NEW order needs approval!',
                        body:`Your order for product (${p.name}) has been initialized. You have 3 days to make a payment for this product!`,
                    })
                    await order.save()
                    await p.save()
                    app.get('io').to(`${p._id}`).emit('auction-ended')
                }
                completion_counter+=1
            }
            if(completion_counter == products.length) {
                execution_flag = true
                completion_counter = 0
            }
        } 
    } catch (error) {
        execution_flag = true
        completion_counter = 0
    }
    
    
});