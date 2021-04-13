const mongoose = require('mongoose')
const countrySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    domain:{
        type:String
    },
    capital:{
        type:String
    },
    timezone:{
        type:String
    },
    code:{
        type:String
    },
    flag:{
        type:String
    },
    lat:{
        type:Number 
    },
    lng:{
        type:Number
    },
    region:{
        type:String
    },
    phone:{
        type:String
    }
})



module.exports = mongoose.model("Country",countrySchema)