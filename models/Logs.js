const mongoose = require('mongoose')


const logSchema = new mongoose.Schema({
    logType:{
        type:String,
        required:true,
        trim:true,
        default:'AUTOMATED ACTIVITY'
    },
    logUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        required:true,
        trim:true,
        default:'NEW'
    }
},{timestamps:true})



module.exports = mongoose.model('Log',logSchema)