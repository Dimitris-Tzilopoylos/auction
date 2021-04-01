const mognoose = require('mongoose')


const supercategorySchema = new mognoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:30,
        unique:true
    },
    supercategory_image : {
        type:String,
        default:'img/supercategories/super.png'
    },
    description:{
        type:String,
        default:"This is a supercategory containing categories of products",
        trim:true,
        minlength:5,
        maxlength:300
    }
},{timestamps:true})


module.exports = mognoose.model('Supercategory',supercategorySchema)