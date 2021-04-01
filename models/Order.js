const mongoose = require('mongoose')



const orderSchema = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    title:{
        type: String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:90
    },
    body:{
        type: String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:50000
    },
    date:{
        type:Date,
        default:Date.now()
    },
    price:{
        type:Number
    },
    currency:{
        symbol:{
            type:String,
            required:true
        },
        iso:{
            type:String,
            required:true
        }
    },
    city:{
        type:String,
        trim:true
    },
    country:{
        type:String,
        trim:true
    },
    address1:{
        type:String,
        trim:true,
        milength:10,
        maxlength:30
    },
    address2: {
        type:String,
        trim:true,
        milength:10,
        maxlength:30,
    },
    phone:{
        type:String,
        trim:true,
        milength:10,
        maxlength:30
    },
    mobile:{
        type:String,
        trim:true,
        milength:10,
        maxlength:30
    },
    paymentMethod:{
        milength:10,
        maxlength:30,
        type:String,
        required:true,
        trim:true,
        default:'bank'
    },
    status:{
        milength:10,
        maxlength:30,
        type:String,
        required:true,
        trim:true,
        default:'needs-approval'
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
})


module.exports = mongoose.model('Order',orderSchema)