const mognoose = require('mongoose')


const categorySchema = new mognoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:30,
        unique:true 
    },
    supercategory:{
        type:mognoose.Schema.Types.ObjectId,
        ref:'Supercategory'
    },
    category_image : {
        type:String,
        default:'img/categories/category.png'
    }
},{timestamps:true})


module.exports = mognoose.model('Category',categorySchema)
