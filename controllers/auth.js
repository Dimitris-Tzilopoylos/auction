const bcrypt = require('bcryptjs')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.postLogin = async (req,res,next) => {
    if(req.session && req.session.isAuthenticated) {
        res.redirect('/dashboard')
        return;
    }
    const {email,password,isAjax} = req.body 
    try {
        const user = await User.findOne({email})
        if(!user) throw new Error('Invalid credentials')
        const isAuth = await bcrypt.compare(password,user.password)
        if(!isAuth) throw new Error('Invalid credentials')
        if(isAjax){
            delete user.password
            req.session.isAuthenticated = true
            req.session.user = user
            const token = jwt.sign({userId:user._id.toString(),email:user.email},process.env.JWT_SECRET)
            res.status(201).json({
                user,
                token,
                message:`Welcome ${user.name} ${user.last_name}`
            })
        }else{
            req.session.isAuthenticated = true
            req.session.user = user
            res.redirect('/dashboard')
            return
        }
    } catch (error) {
        error.status = 400;
        error.message = error.message || "Log in failed"
        error.path = "/login?error="+error.message
        error.isAjax = req.body.isAjax
        next(error)
    }
}


exports.getLogin = (req,res,next) => {
    const message = req.query.message || null
    const error = req.query.error || null 

    if(req.session && req.session.isAuthenticated) {
        res.redirect('/dashboard')
        return;
    }

    res.render('login',{message,error})
}

exports.postRegister = async (req,res,next) => {
    if(req.session && req.session.isAuthenticated) {
        res.redirect('/dashboard')
        return;
    }
    const {email,password,isAjax,name,last_name,city,country,address1,address2,phone,mobile} = req.body 
    try {
        const user = await User.findOne({email})
        if(user) throw new Error('This email address is not available')
        const hashPWD = await bcrypt.hash(password,12)
        if(!hashPWD) throw new Error('Invalid credentials')
        const newUser = new User({email,password:hashPWD,name,last_name,city,country,phone,mobile,address1,address2})
        await newUser.save()
        if(isAjax){
             res.status(201).json({
                message:`Your account has been created ${newUser.name} ${newUser.last_name}. Try to login`
            })
        }else{
            res.redirect('/register?message='+`Your account has been created ${newUser.name} ${newUser.last_name}. Try to login`)
            return
        }
    } catch (error) {
        error.status = 400;
        error.message = error.message || "Registration failed"
        error.path = "/register?error="+error.message
        error.isAjax = req.body.isAjax
        next(error)
    }
}


exports.getRegister = (req,res,next) => {
    const message = req.query.message || null
    const error = req.query.error || null 
     if(req.session && req.session.isAuthenticated) {
        res.redirect('/dashboard')
        return;
    }
    res.render('register',{message,error})
}



exports.getLogout = (req,res,next) => {
    if(req.session && req.session.isAuthenticated) {
        
        req.session.isAuthenticated = false 
        req.session.user = null
        req.session.destroy()
        res.redirect("/login")
        return 
    }else{
        req.session.isRedirect = true
        res.redirect('/404')
    }
}