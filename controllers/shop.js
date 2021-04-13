const Category = require('../models/Category')
const Supercategory = require('../models/Supercategory')
const Product = require('../models/Product')
const Country = require('../models/Country')
const Bid = require('../models/Bid')
const utils = require('../utils/utils')
const app = require('../app')
const Order = require('../models/Order')

exports.getHomePage = async (req,res,next) => {

    try {
        res.render('shop/index')
    } catch (error) {
        res.redirect('/login')
    }
}



exports.getAjaxCategoryBySuper = async (req,res,next) => {
    try {
        const checks = await Product.distinct('category',{status:'READY',supercategory:req.query.supercategory,bid_end_date:{$gt:new Date().toISOString()}})
        const categories = await Category.find({_id:{$in:checks}})
        if(!categories) throw new Error()
        res.status(200).render('shop/partials/categoriesindex',{categories})
    } catch (error) {
        res.status(404).send("<p class='alert alert-danger'>No Categories found </p>")
    }
}

exports.getSupercategoryPage = async (req,res,next) => {
    try {
        const checks = await Product.distinct('category',{status:'READY',supercategory:req.params.super_id,bid_end_date:{$gt:new Date().toISOString()}})
        const categories = await Category.find({_id:{$in:checks}})
        if(!categories) throw new Error()
        res.render('shop/categories',{categories})
    } catch (error) {
        res.redirect('/')
    }


}

exports.getCategoryPage = async (req,res,next) => {
    try {
        const category = await Category.findOne({name:req.params.category_name})
        if(!category) {
            throw new Error('Page not found')
        }
        res.render('shop/productPage',{category})
    } catch (error) {
        error.status = 404;
        error.message = error.message || "Page not found"
        error.path = "/404"
        error.isAjax = false 
        next(error)
    }
}


exports.getProductsAjax = async (req,res,next) => {
    try {
        const data = await utils.paginate(Product,req.query.page || 1,req.query.view || 12,{status:"READY",category:req.params.category_id,bid_end_date:{$gt:new Date().toISOString()}},{},true,'user','name last_name profile_img city country')
        if(!data) throw new Error('404')
        data.category_id = req.params.category_id
        res.render('ajax/products',data)
    } catch (error) {       
        res.status(404).send('<p class="alert alert-danger text-center">No Products found</p>')
    }
}


exports.getBidPage = async (req,res,next) => {
    
    try {
        if(!req.session.isAuthenticated) throw new Error('404')
 
        const product = await Product.findById(req.params.product_id).populate('user','name last_name profile_img city country')
        const bids = await Bid.find({product:req.params.product_id}).limit(10).sort({'createdAt':-1}).populate('user','name last_name profile_img')
        bids.sort((a,b)=>a.price-b.price)
 
        if(!product) throw new Error('404')
        else res.render('shop/bidPage',{product,bids,currency:product.currency})
    } catch (error) {
 
        error.status = 404;
        error.message = error.message || "Page not found"
        error.path = "/404"
        error.isAjax = false 
        next(error)
    }
}




exports.bidProduct = async (req,res,next) => {
    try {
        if(!req.session.isAuthenticated) throw new Error('Invalid product')
        if(req.session.user._id != req.body.user.user_id) throw new Error('Invalid user')
        // if(typeof req.body.end_price != 'number') throw new Error('Price should be a number')
        try {
             req.body.end_price = parseFloat(req.body.end_price).toFixed(2) || 0
        } catch (error) {
      
            throw new Error('Price should be a number')
        }
        let make_the_calc
        let date_check = new Date().getTime() /1000
        const product = await Product.findById(req.body.product_id)
        if(!product) throw new Error('No such product')
        if(product.sold.user || product.status == "SOLD") throw new Error('This product is already sold')
        if(product.user == req.body.user.user_id) throw new Error('You can not bid on your own product')
        if(!req.session.last_bid) {
            req.session.last_bid = date_check 
        }else{
            make_the_calc = Math.abs(date_check  - new Date(req.session.last_bid).getTime() / 1000 )
             
        }
        console.log(parseInt(make_the_calc))
        if(product.end_price >=req.body.end_price) throw new Error(`Any bid should be more than ${product.start_price} ${product.currency.symbol}.`)
        if(make_the_calc - 60 < 0) throw new Error('Wait one minute and then try to place another bid')
        else{
            req.session.last_bid = new Date()
        }
        product.end_price = req.body.end_price 
        const newBid = new Bid({user:req.body.user.user_id,product:product._id,price:product.end_price,currency:{symbol:product.currency.symbol,iso:product.currency.iso}})
        product.last_bid = newBid
        await newBid.save()
        await product.save()
        app.get('io').to(product._id.toString()).emit('new_evaluation',{
            end_price:product.end_price,
            user:{
                name:req.body.user.name,
                last_name:req.body.user.last_name,
                profile_img:req.session.user.profile_img,
                bid:newBid
            }   
        })
      
        res.status(201).send('You have submitted a new bid')
    } catch (error) {
        res.status(404).send(`<p class="alert alert-danger text-center">${error.message}</p>`)
    }
}



exports.getCheckout = async (req,res,next) => {
    let checkoutError = null;
    let checkoutMessage = null;
    try {
        if(req.session.setError && req.query.checkoutError) {
            checkoutError = req.query.checkoutError
            req.session.setError = false
        }
        if(req.session.setError && req.query.checkoutMessage) {
            checkoutMessage = req.query.checkoutMessage
            req.session.setError = false
        }
        
        const order = await Order.findOne({_id:req.params.order_id,to:req.session.user._id,status:{$ne:'SOLD'}}).populate('product')
        if(!order) throw new Error('This order is not valid')
        const countries = await Country.find({region:'Europe'})
        res.render('shop/checkout',{order,countries,checkoutError,checkoutMessage})
    } catch (error) {
        req.session.setError = true
        res.redirect(`/dashboard/orders`)
    }
 
}