



const isAuth = (req,res,next) => {
    if(req.session.isAuthenticated){
        next()
    }else{
        let err = new Error('Please login')
        err.status = 400 
        err.isAjax = false
        err.path = '/login'
        next(err)
    }
}


module.exports = isAuth