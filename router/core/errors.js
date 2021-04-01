const router = require('express').Router()

router.get('/404',(req,res,next)=>{
    if(!req.session.isRedirect){ res.redirect('/');return;}
    if(req.session && req.session.isRedirect){
        req.session.isRedirect = false 
    }

    res.render('errors/404')
})

module.exports = router 