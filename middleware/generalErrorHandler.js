const generalErrorHandler = (error,req,res,next)=>{
console.log(error)
    if(error.path && !error.isAjax) {
       res.redirect(error.path)
       return 
   }
   if(error.isAjax){
       res.status(error.status || 503).json({
           error:error.message,
           status : error.status
       })
       return
   }
   try {
       req.session.isRedirect = true
   } catch (error) {
       
   }
   
   res.redirect('/404')

}


module.exports = generalErrorHandler