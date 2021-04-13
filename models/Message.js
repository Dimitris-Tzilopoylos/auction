const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    subject:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:15,
        default:'Customer Service Notification'
    },
    message:{
        type:String,
        required:true,
        minlength:2,
        maxlength:1500,
        trim:true
    },
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    seen:{
        type:Boolean,
        default:false
    },
    isResponse:{
        type:Boolean,
        default:false
    },
    parentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    },
    responses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    }],
    status:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

module.exports = mongoose.model('Message',messageSchema)