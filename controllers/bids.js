const Product = require('../models/Product')
const Supercategory = require('../models/Supercategory')
const Category = require('../models/Category')



exports.landingPage = async (req,res,next) => {
    

    const supercategories = await Supercategory.find()

    res.render('home',{supercategories})
}