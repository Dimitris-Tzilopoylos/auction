const User = require('../models/User')
const fs  = require('fs/promises')


exports.getProfile = async (req,res,next) => {

    let error;
    let message;
    if(!req.session || !req.session.isAuthenticated){
        res.redirect('/login?error=Please login first')
        return
    }

    if(req.session.setError && req.query.error) {
        error = req.query.error 
    }
    if(req.session.setError && req.query.message) {
        message = req.query.message
        
    }
    req.session.setError = false
    res.render('profile',{error,message})

}


exports.uploadProfileImg = async (req,res,next) => {
    const allowed_errors = ['Images should be 500 KB maximum in size']
    try {
        const error = new Error()
        
        if (!req.file) {        
            error.path = '/dashboard/profile?error=Please provide an image';
            error.isAjax = false 
            req.session.setError = true
            return next(error)
          } else {  
            const user = await User.findById(req.session.user._id)
            if(!user) {
                error.path = '/login?error=Please log in to continue';
                error.isAjax = false 
                req.session.setError = true
                return next(error)
            }  
            if(req.file.size > 560000 ){
                try {
                   let s = await fs.unlink(req.file.destination+req.file.filename) 
                } catch (error) {
                    throw new Error('Images should be 500 KB maximum in size')
                }
                
                throw new Error('Images should be 500 KB maximum in size')
            }
            try {
                if(!user.profile_img.includes('default.png'))
                    await fs.unlink('public/'+user.profile_img) 
             } catch (error) {
                    //  throw new Error('Something went wrong')
             }
            user.profile_img = 'img/users/'+req.file.filename
            await user.save()
            req.session.setError = true
            res.locals.user.profile_img = 'img/users/'+req.file.filename
            
            return res.redirect('/dashboard/profile?message=You have successfully uploaded a new profile image')
          }
    } catch (error) {
            error.path = `/dashboard/profile?error=${allowed_errors.includes(error.message) ? error.message : 'Something went wrong'}`;
            error.isAjax = false 
            req.session.setError = true
            return next(error)
    }
}


exports.updateProfile = async (req,res,next) => {
    if(!req.session.isAuthenticated){
        res.redirect('/login?error=Please login in order to continue')
        return
    }
    try {
        if(Object.keys(req.body).length ===0){
            throw new Error()
        }else{
            Object.values(req.body).forEach(value => {
                value = value.toString().trim()
            })
        }
        const {name,last_name,city,country,address1,address2,phone,mobile} = req.body 
        if(name.length < 2 || name.length > 15) throw new Error()
        if(last_name.length < 2 || last_name.length > 15) throw new Error()
        if(city.length < 3 || city.length > 20) throw new Error()
        if(country.length < 2 || country.length > 20 ) throw new Error()
        if(address1.length < 2 || address1.length > 16) throw new Error()
        if(address2)
            if(address2.length < 2 || address2.length > 16) throw new Error()
        if(!phone && !mobile) throw new Error()
        if(phone.length < 9 || phone.length > 15) throw new Error()
        if(!phone && mobile) 
            if(mobile.length < 9 || mobile.length > 15) throw new Error()
       
        const user = await User.findById(req.session.user._id)
        if(!user){
            const error = new Error()
            error.message = 'Please login'
            error.isAjax = false 
            req.session.setError = true
            error.path = '/login?error='+error.message 
            next(error)
        }
        user.address1 = address1 
        user.address2 = address2 
        user.city = city 
        user.name = name 
        user.last_name = last_name 
        user.country = country 
        user.phone = phone
        user.mobile = mobile
        await user.save()
        req.session.user = user
        res.locals.user = user
        req.session.setError = true
        res.redirect('/dashboard/profile?message=Your profile details has been updated successfully')
    } catch (error) {
 
        error.path = `/dashboard/profile?error=Updating your profile failed`;
        error.isAjax = false 
        req.session.setError = true
        return next(error)
    }
}