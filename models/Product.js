const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:90
    },
    supercategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Supercategory'
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    start_price:{
        type:Number,
        required:true
    },
    end_price:{
        type:Number,
        required:true,
        default:0
    },
    status:{
        type:String,
        default:'NEW'
    },
    sold:{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        date: {
            type:Date,
            default:Date.now()
        },
        price:{
            type:Number,
           
        },
        currency:{
            symbol:{
                type:String
            },
            iso:{
                type:String
            }
        },
        status:{
            type:String,
            default:"OK"
        }
    },
    bid_date:{
        type:Date,
        default:Date.now()
    },
    bid_end_date:{
        type:Date
    },
    description:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        maxlength:6000
    },
    images:{
        type:[String],
        default:['/img/products/product.png']
    },
    currency:{
        iso:{
            type:String,
            required:true 
        },
        symbol:{
            type:String,
            required:true
        }
    },
    last_bid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Bid'
    }
},{timestamps:true})


module.exports = mongoose.model('Product',productSchema)