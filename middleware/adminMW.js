const isAdmin = function(req,res,next){
    
    if(req.session.isAuthenticated){
        if(req.session.user.isAdmin)
            next()
        else{
            let err = new Error('Page not found')
            err.status = 404
            err.isAjax = false
            err.path = '/404'
            next(err)
        }
    }else{
        let err = new Error('Please login')
        err.status = 400 
        err.isAjax = false
        err.path = '/login'
        next(err)
    }
}


module.exports = isAdmin