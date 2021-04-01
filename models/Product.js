const mognoose = require('mongoose')


const productSchema = new mognoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:90
    },
    supercategory:{
        type:mognoose.Schema.Types.ObjectId,
        ref:'Supercategory'
    },
    category:{
        type:mognoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    user:{
        type:mognoose.Schema.Types.ObjectId,
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
            type:mognoose.Schema.Types.ObjectId,
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
 
    }
},{timestamps:true})


module.exports = mognoose.model('Product',productSchema)