const Product  = require('../models/Product')
const User = require('../models/User')
const Supercategory  = require('../models/Supercategory')
const Category  = require('../models/Category')
const Bid  = require('../models/Bid')
const utils = require('../utils/utils')
const Order = require('../models/Order')
const Country = require('../models/Country')




exports.getDashboard = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }

    // const total_my_products = await Product.countDocuments({user:req.session.user._id})
    // const total_my_bids =  await Bid.countDocuments({user:req.session.user._id})
    res.render('admin/index')
} 

exports.getReports = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }

    res.render('admin/charts')
} 

exports.getProducts = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }
    
    try {
        const data = {}
        const supercategories = await Supercategory.find()
        const categories = await Category.find()
        data.categories = categories 
        data.supercategories = supercategories
        data.showForm = req.query.showForm && req.session.setError ? 1 : 0
        data.productError = req.query.productError && req.session.setError  ? req.query.productError  : null 
        delete req.session.setError
        res.render('admin/tables',data)
    } catch (error) {
 
        res.redirect('/dashboard')
    }
} 

exports.getProductsAJAX = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.status(404).send('<p class="alert alert-sm alert-danger">No Products found at the moment</p>')
        return 
    }
 
    try {
        const data = await utils.paginate(Product,req.query.page || 1,req.query.view || 12,{user:req.session.user._id},{},true,'category supercategory')
        res.status(200).render('ajax/adminProductContent',data)
        if(!data.obj) throw new Error()
    } catch (error) {
         res.status(404).send('<p class="alert alert-sm alert-danger">No Products found at the moment</p>')
    }
} 

exports.getProfile = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }

    res.render('admin/profile')
} 

exports.getBids = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }   
    try {
        if(!req.params.product_id) throw new Error('No such product')
        const product = await Product.findOne({_id:req.params.product_id,user:req.session.user._id})
        if(!product) throw new Error('No such product')
        const bids = await Bid.find({product:product._id}).sort({'createdAt':1}).populate('user','name last_name city country profile_img')
        if(!bids) throw new Error()
        res.render('admin/charts',{product,bids})
    } catch (error) {
        
        res.redirect('/dashboard/products')
    }
}

exports.getBidsByProductAjax = async (req,res,next) => {
    try {
        if(!req.params.product) throw new Error('No such product')
        const data = await utils.paginate(Bid,req.query.page || 1,req.query.view || 24,{product:req.params.product_id},{},true,'user','name last_name city country profile_img')
        if(!data.obj) throw new Error()
        res.status(200).render('ajax/adminBidsContent',data)
    } catch (error) {
        res.status(404).send('<p class="alert alert-sm alert-danger">No Bids found at the moment</p>')
    }
}

exports.getOrders = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }

    res.render('admin/table')
} 

exports.createProduct = async (req,res,next) => {
    const currencies = {
        "EUR":'€',
        "RON":'lei',
        "PLN":'zl',
        "SEK":'kr',
        "GBP":'£'
    }
    try {
        if(!req.session.isAuthenticated) {
            res.redirect('/login?error=Please login first')
            return 
        }
        const check_category = await Category.findOne({_id:req.body.category,supercategory:req.body.supercategory})
        if(!check_category) throw new Error('Invalid fields')
        if(!req.body.currency || !req.body.start_price || !req.body.bid_end_date || !req.body.description) throw new Error('All fields are required')
        const currency = req.body.currency 
        const symbol = currencies[currency.toUpperCase()]
        if(!req.body.status) req.body.status = "NEW"
        else {
            if(!["NEW","READY"].includes(req.body.status.toUpperCase())) throw new Error('Invalid status field')
            else req.body.status = req.body.status.toUpperCase()
        }
        if(!req.body.bid_date)
            req.body.bid_date = new Date()
        else  req.body.bid_date = new Date(req.body.bid_date)
        if(!req.body.bid_end_date) throw new Error('End date should be greater than the starting date')
        else req.body.bid_end_date = new Date(req.body.bid_end_date)
        if(!req.body.bid_end_date || req.body.bid_end_date < req.body.bid_date) throw new Error('End date should be greater than the starting date')
        const newProduct = await new Product({...req.body,currency:{iso:currency,symbol},user:req.session.user._id}).save()
        res.redirect('/dashboard/products?page=1')
    } catch (error) {

       req.session.setError = true
       if(error.message == 'End date should be greater than the starting date' || error.message == 'All fields are required' || error.message == "Invalid fields")
            res.redirect(`/dashboard/products?page=1&&productError=${error.message}&showForm=1`)
        else res.redirect('/dashboard/products?page=1&&productError=Product was not created&showForm=1')
    }
}

exports.updateProduct = async (req,res,next) => {
    const currencies = {
        "EUR":'€',
        "RON":'lei',
        "PLN":'zl',
        "SEK":'kr',
        "GBP":'£'
    }
    try {
        if(!req.session.isAuthenticated) {
            res.redirect('/login?error=Please login first')
            return 
        }
        const bid = await Bid.find({product:req.body.product_id}).limit(1)

        if(bid && bid.length == 1) throw new Error('This product cannot be modified due to being on the bid process already')
        if(!req.body.currency || !req.body.start_price || !req.body.bid_end_date || !req.body.description) throw new Error('All fields are required')
        const currency = req.body.currency 
        const symbol = currencies[currency.toUpperCase()]
        if(!req.body.bid_date)
            req.body.bid_date = new Date()
        else  req.body.bid_date = new Date(req.body.bid_date)
        if(!req.body.bid_end_date) throw new Error('End date should be greater than the starting date')
        else req.body.bid_end_date = new Date(req.body.bid_end_date)
        if(!req.body.bid_end_date || req.body.bid_end_date < req.body.bid_date) throw new Error('End date should be greater than the starting date')
        const product = await Product.findOneAndUpdate({_id:req.body.product_id,user:req.session.user._id},{...req.body,currency:{iso:currency,symbol}}) 
        res.redirect(`/dashboard/product/${product._id}`)
    } catch (error) {
       req.session.setError = true

       if(error.message == 'End date should be greater than the starting date' || error.message == 'All fields are required' || error.message == "Invalid fields" || error.message == "This product cannot be modified due to being on the bid process already")
            res.redirect(`/dashboard/product/${req.body.product_id}?productError=${error.message}`)
        else res.redirect(`/dashboard/product/${req.body.product_id}?productError=Something went wrong`)
    }
}


exports.deleteProduct  = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }
    try {
        const bid = await Bid.find({product:req.body.product_id}).limit(1)
        if(bid && bid.length == 1) throw new Error('This product cannot be modified due to being on the bid process already')
        // const deleted = await Product.findOneAndDelete({_id:req.body.product_id,user:req.session.user._id,bid_end_date:{$gt:new Date().toISOString()}})
        const deleted = await Product.findOneAndDelete({_id:req.body.product_id,user:req.session.user._id })
        if(!deleted) throw new Error()
        res.redirect('/dashboard/products?page=1')
    } catch (error) {
        req.session.setError = true
        if(error.message == 'End date should be greater than the starting date' || error.message == 'All fields are required' || error.message == "Invalid fields" || error.message == "This product cannot be modified due to being on the bid process already")
            res.redirect(`/dashboard/product/${req.body.product_id}?productError=${error.message}`)
        else res.redirect(`/dashboard/product/${req.body.product_id}?productError=Something went wrong`)
    }
}

exports.productDetails = async (req,res,next) => {
    if(!req.session.isAuthenticated) {
        res.redirect('/login?error=Please login first')
        return 
    }
    try {
        if(!req.session.setError){
            req.query.productError = null
        }
        req.session.setError = false
        const hasBids = await Bid.countDocuments({product:req.params.product_id})
        const product = await Product.findOne({_id:req.params.product_id,user:req.session.user._id}).populate('sold.user','name email city country address1 address2 profile_img last_name phone mobile')
        if(!product) throw new Error('Product was not found')
        res.render('admin/adminProductDetails',{product,hasBids,productError:req.query.productError || null})
    } catch (error) {
        req.session.setError = true 
        res.redirect('/dashboard/products?productError=Product was not found')
    }
}

exports.myBids = async (req,res,next) => {
    
    try {
        if(!req.session.isAuthenticated) {
            res.redirect('/login')
            return
        }
        // const myBids = await Bid.find()
    } catch (error) {
        
    }
}

exports.myOrderPage = async (req,res,next) => {
    let orderError;
    let orderMessage;
    let orders;
    if(req.session.setError && req.query.orderError) {
        orderError = req.query.orderError
    }
    if(req.session.setError && req.query.orderMessage) {
        orderError = req.query.orderMessage
    }
    try {
        if(!req.session.isAuthenticated){
            throw new Error('Please login first')
        }
        if(!req.session.user.isAdmin)
            orders = await Order.distinct('status',{to:req.session.user._id})
        else 
            orders = await Order.distinct('status',{})
        req.session.setError = false
        const renderPage = req.session.user.isAdmin  ? 'admin/adminOrders' : 'admin/myOrders'
        res.render(renderPage,{orders,orderError,orderMessage})
    } catch (error) {
        error.status = 400
        error.message = 'Please login first'
        error.isAjax = false 
        error.path = "/login?error="+error.message
        next(error)
    }
}

exports.myOrderPageAjax = async (req,res,next) => {
    let data
    let allowedStatuses = ['pending','completed','needs-approval','canceled','rejected'];
     
    try {
        if(!req.session.isAuthenticated){
           throw new Error('Please login first')
        }
        if(!req.query.status){
            if(!req.session.user.isAdmin)
                data = await utils.paginate(Order,req.query.page || 1,req.query.view || 12,{to:req.session.user._id},{},true,'from product')
            else 
                data = await utils.paginate(Order,req.query.page || 1,req.query.view || 12,{},{},true,'to product')
        }    
        else{
            if(allowedStatuses.includes(req.query.status)) {
                if(!req.session.user.isAdmin)
                    data = await utils.paginate(Order,req.query.page || 1,req.query.view || 12,{to:req.session.user._id,status:req.query.status},{},true,'from product')
                else
                    data = await utils.paginate(Order,req.query.page || 1,req.query.view || 12,{status:req.query.status},{},true,'to product')
            }else{
                if(!req.session.user.isAdmin)
                    data = await utils.paginate(Order,req.query.page || 1,req.query.view || 12,{to:req.session.user._id},{},true,'from product')
                else 
                    data = await utils.paginate(Order,req.query.page || 1,req.query.view || 12,{},{},true,'to product')
            }
        }
        if(!data.obj) throw new Error()
        const renderPage = req.session.user.isAdmin  ? 'ajax/adminOrders' : 'ajax/orders'
        res.status(200).render(renderPage,data)
    } catch (error) {
        res.status(404).send("<p class='alert alert-primary'>You have no orders at the moment</p>")
    }
} 

exports.makeProductSold = async (req,res,next) => {
    const allowedPaymentMethods = ['bank','paypal','cod','visa','bitcoin']
    if(!req.session.isAuthenticated){
        res.redirect('/login');
        return
    }
    try {
        if(req.params.product_id !== req.body.product_id) throw new Error('Bad request!')
        let paymentMethod = req.body.paymentMethod.toLowerCase().trim()
        if(!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) throw new Error('Invalid payment method!')
        let product = await Product.findOne({_id:req.body.product_id,user:req.session.user._id})
        if(product.status.toUpperCase() === "SOLD") throw new Error('This product is already sold!')
        if(!product) throw new Error('No such product')
        product = product 
        if(product.sold.user) throw new Error('This product is already sold!')
        
        let last_bid = await Bid.find({product:product._id}).sort({'createdAt':-1}).populate('user','_id name last_name email city country address1 address2 phone mobile profile_img').limit(1)
        if(!last_bid) throw new Error('This product has no bids')
        last_bid = last_bid[0]
        product.sold = { 
            user:last_bid.user,
            price:last_bid.price,
            currency: {...last_bid.currency},
        }
        product.status = "SOLD"
        await product.save()
        const order = new Order({
            product:product._id,
            from:req.session.user._id,
            to:product.sold.user,
            paymentMethod:paymentMethod,
            price:product.sold.price,
            currency:product.sold.currency,
            title:'NEW order needs approval!',
            body:`User ${req.session.user.name} ${req.session.user.last_name} approved your purchase after bidding to his product (${product.name}). You have 3 days to make a payment for this product!`,
        })
        await order.save()
        res.redirect(`/dashboard/product/${product._id}`)
    } catch (error) {
        req.session.setError = true
        res.redirect('/dashboard/products?page=1&&productError=Order was not submitted');
    }
}

exports.productDetailsBeforeCheckout = async (req,res,next) => {
    let orderError;
    let orderMessage;
    if(req.session.setError && req.query.orderError) {
        orderError = req.query.orderError
    }
    if(req.session.setError && req.query.orderMessage) {
        orderError = req.query.orderMessage
    }
    try {
        const {order_id} = req.params
 
        if(!order_id) throw new Error('Bad request')
        const order = await Order.findOne({_id:order_id,to:req.session.user._id}).populate('to','name email last_name address1 address2 city country phone mobile blacklist isAdmin').populate('product')

        if(!order) throw new Error('Bad request')
        if(!order.product) throw new Error('Bad request')
        if(order) {
            if(order.to.blacklist) {
                res.redirect('/logout')
                return
            }
            if(order.to.isAdmin) {
                res.redirect('/dashboard')
                return
            }
        }
        req.session.setError = false
        res.render('admin/orderDetails',{order,orderMessage,orderError,checkout:order.status == 'needs-approval' ? true : false})
    } catch (error) {
        console.log(error)
        res.redirect('/dashboard/orders')
    }
}

exports.manageOrderPage = async (req,res,next) => {
    try {
        const order_id = req.params.order_id
        if(!order_id) throw new Error('No such Order')
        const parcelServices = ['UPS','TNT','ACS','DHL'];
        const order = await Order.findOne({_id:order_id}).populate('to','name email last_name address1 address2 profile_img city country phone mobile blacklist isAdmin').populate('product') 
        const countries = await Country.find({region:'Europe'})
        if(!order) throw new Error('No such Order')
        res.render('admin/manageOrder',{order,parcelServices,countries})
    } catch (error) {
        req.session.setError = true
        res.redirect(`/dashboard/orders?orderError=Order with id : ${req.params.order_id} was not found`)
    }
}

exports.orderDetails = async (req,res,next) => {
    let orderError;
    let orderMessage;
    let order;
    if(req.session.setError && req.query.orderError) {
        orderError = req.query.orderError
    }
    if(req.session.setError && req.query.orderMessage) {
        orderError = req.query.orderMessage
    }
    try {
        const {order_id} = req.params
 
        if(!order_id) throw new Error('Bad request')
        if(!req.session.user.isAdmin)
            order = await Order.findOne({_id:order_id,to:req.session.user._id,status:'completed'}).populate('to','name email last_name address1 address2 city country phone mobile blacklist isAdmin').populate('product','name end_price images status start_price')
        else
            order = await Order.findOne({_id:order_id}).populate('to','name email last_name address1 address2 city country phone mobile blacklist isAdmin').populate('product')
        if(!order) throw new Error('Bad request')
        if(!order.product) throw new Error('Bad request')
        if(order) {
            if(order.to.blacklist) {
                res.redirect('/logout')
                return
            }
            if(order.to.isAdmin) {
                res.redirect('/dashboard')
                return
            }
        }
        req.session.setError = false
        res.render('admin/orderCompletedDetails',{order,orderMessage,orderError})
    } catch (error) {
        console.log(error)
        res.redirect('/dashboard/orders')
    }
}

exports.manageUsers = async (req,res,next) => {
    let userError = null;
    let userMessage = null;
    if(req.session.setError && req.query.userError) {
        userError = req.query.userError
    }
    if(req.session.setError && req.query.userMessage) {
        userMessage = req.query.userMessage
    }
    req.session.setError = false
    res.render('admin/manageUsers',{userError,userMessage})
}

exports.getUsersAjax = async (req,res,next) => {
    if(!req.session.user.isAdmin) {
        res.status(404).send('<p class="alert alert-sm alert-danger">No Users found at the moment</p>')
        return 
    }

    try {
        const data = await utils.paginate(User,req.query.page || 1,req.query.view || 12,{},{},false)
        res.status(200).render('ajax/users',data)
        if(!data.obj) throw new Error()
    } catch (error) {
         res.status(404).send('<p class="alert alert-sm alert-danger">No users found at the moment</p>')
    }
} 


exports.getUserDetails = async (req,res,next) => {
    let userMessage;
    let userError;
    if(req.session.setError && req.query.userError) {
        userError = req.query.userError
    }
    if(req.session.setError && req.query.userMessage) {
        userMessage = req.query.userMessage
    }
    try {
        req.session.setError = false
        const user = await User.findById(req.params.user_id)
        if(!user) {
            req.session.setError = true
            res.redirect('/dashboard/users?userError=User not found')
            return
        }
        delete user.password 
        const orders = await Order.countDocuments({to:user._id})
        const bids = await Bid.countDocuments({user:user._id})
        res.render('admin/userDetails',{_user:user,orders,bids,userError,userMessage})
    } catch (error) {
        req.session.setError = true
        res.redirect('/dashboard/users?userError=Something went wrong')
    }
}


exports.privileges = async (req,res,next) => {
    const allowedPrivileges = ['Admin','Member'];
    let user
    try {
        if(req.params.user_id != req.body.user_id) throw new Error('Bad request')
        user = await User.findById(req.body.user_id)
        if(!user ) throw new Error('Bad request')
        if(!req.body.isAdmin || !allowedPrivileges.includes(req.body.isAdmin)) throw new Error('Bad request')
        user.isAdmin = req.body.isAdmin == "Admin" ? true : false;
        await user.save()
        req.session.setError = true
        res.redirect(`/dashboard/user/${req.params.user_id}?userMessage=You changed membership of user ${user.name} ${user.last_name} to ${user.isAdmin ? 'Admin' : 'Member'}`)
    } catch (error) {
        req.session.setError = true
        res.redirect(`/dashboard/user/${req.params.user_id}?userError=Updating membership failed`)
    }
}


exports.blacklist = async (req,res,next) => {
    const allowedActions = ['block','unblock'];
    let user
    try {
        if(req.params.user_id != req.body.user_id) throw new Error('Bad request')
        user = await User.findById(req.body.user_id)
        if(!user ) throw new Error('Bad request')
        if(!req.body.blacklist || !allowedActions.includes(req.body.blacklist)) throw new Error('Bad request')
        user.blacklist = req.body.blacklist == "block" ? true : false;
        await user.save()
        req.session.setError = true
        res.redirect(`/dashboard/user/${req.params.user_id}?userMessage=You ${req.body.blacklist == 'block' ? 'blocked' : 'unblocked'} user ${user.name} ${user.last_name}`)
    } catch (error) {
        console.log(error)
        req.session.setError = true
        res.redirect(`/dashboard/user/${req.params.user_id}?userError=Updating access failed`)
    }
}