const mongoose = require('mongoose')



const userSchema = new mongoose.Schema({
    name:{
        type:String,
        maxlength:15,
        minlength:2,
        required:true,
        trim:true
    },
    last_name:{
        type:String,
        maxlength:15,
        minlength:2,
        required:true,
        trim:true
    },
    email:{
        type:String,
        maxlength:50,
        minlength:6,
        required:true,
        trim:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        minlength:8,
        required:true,
        trim:true
    },
    profile_img:{
        type:String,
        required:true,
        default:'img/users.default.png'
    },
    city:{
        type:String,
        required:true,
        trim:true
    },
    country:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number
    },
    address1:{
        type:String,
        trim:true,
        default:'Add an address'
    },
    address2: {
        type:String,
        trim:true,
        default:'Add an address'
    },
    phone:{
        type:String,
        trim:true,
        default:'Add a phone number'
    },
    mobile:{
        type:String,
        trim:true,
        default:'Add your mobile phone'
    },
    blacklist:{
        type:Boolean,
        default:false
    },
    earnings:{
        type:Number,
        default:0
    },

},{timestamps:true})



module.exports = mongoose.model('User',userSchema)