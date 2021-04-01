
const Supercategory = require('../models/Supercategory')
const Product = require('../models/Product')

const localCaching = async (req,res,next)=>{
        res.locals.isAuthenticated = req.session.isAuthenticated || false 
        res.locals.user = req.session.user  || {}
        req.session.last_bid = req.session.last_bid ? req.session.last_bid :  new Date()
        res.locals.last_bid = req.session.last_bid ? req.session.last_bid :  new Date()
        if(!req.originalUrl.includes('ajax')){
        if(!req.session.supercategories) {
            req.session.supercategories = {}
            req.session.supercategories.last_updated = new Date().getTime()/1000
            const checks = await Product.distinct('supercategory',{status:'READY',bid_end_date:{$gt:new Date().toISOString()}})
            const supercategories  = await Supercategory.find({_id:{$in:checks}})
            req.session.supercategories.supercategories = supercategories
        }else{
            if(req.session.supercategories.last_updated) {
                let x = new Date().getTime()/1000
                let check = Math.abs(x - req.session.supercategories.last_updated)
                if(check >120) {
                    req.session.supercategories.last_updated = new Date().getTime()/1000
                    const checks = await Product.distinct('supercategory',{status:'READY',bid_end_date:{$gt:new Date().toISOString()}})
                    const supercategories  = await Supercategory.find({_id:{$in:checks}})
                    req.session.supercategories.supercategories = supercategories
                }
            } 
        }
        res.locals.supercategories_ = req.session.supercategories.supercategories
        }
         
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next()
    }

module.exports = localCaching