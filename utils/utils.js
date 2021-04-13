exports.paginate = async (Model,page,view,args={},meta={},populate=false,populate_fields='',populate_specific='') =>{

    const total = await Model.countDocuments(args)
    page = parseInt(page)
    view = parseInt(view,10)
    if(page < 0 ) page = 1
    if(view != 12 && view != 24 &&  view != 48) view = 24 
    let skip = (page-1)*view
    let limit = Math.ceil(total/view)
    if(limit < page ) page = limit 
    let obj
    if(!populate)
         obj = await Model.find(args).skip(skip).limit(view).sort(typeof meta == "object" && Object.keys(meta).length > 0 ? meta : {'createdAt':-1})
    else{
        if(populate_specific){
            obj = await Model.find(args).populate(populate_fields,populate_specific).skip(skip).limit(view).sort(typeof meta == "object" && Object.keys(meta).length > 0 ? meta : {'createdAt':-1})
        }else{
            obj = await Model.find(args).populate(populate_fields).skip(skip).limit(view).sort(typeof meta == "object" && Object.keys(meta).length > 0 ? meta : {'createdAt':-1})
        }
    }
    return {
        obj,
        total,
        limit,
        currentPage:page,
        view,
        args
    }
}

exports.validateOrderDetails = (orderDetails) => {
    const errors = {}
    const { name,last_name,address1,address2,phone,mobile,zip,country,city,paymentMethod,comments,email} = orderDetails 
    if(!name || name.toString().length < 2) errors['name'] = 'Name field should be between 2 and 15 characters'
    if(!last_name || last_name.toString().length < 2) errors['last_name'] = 'Last name field should be between 2 and 15 characters'
    if(!address1 && !address2) errors['address1'] = 'Please provide a valid address'
    if(!address2 && address1 && address1.toString().length < 2 || address1.toString().length > 30) errors['address1'] = 'Please provide a valid address'
    if(!address1 && address2 && address2.toString().length < 2 || address2.toString().length > 30) errors['address2'] = 'Please provide a valid address'
    if(!phone && !mobile) errors['phone'] = 'Please provide a valid phone number'
    if(!phone && mobile && mobile.toString().length < 10 || mobile.toString().length > 18) errors['mobile'] = 'Please provide a valid phone number'
    if(!mobile && phone && phone.toString().length < 10 || phone.toString().length > 18) errors['phone'] = 'Please provide a valid phone number'
    if(!city || city.toString().length < 3 || city.toString().length > 40) errors['city'] = 'Please provide a valid City'
    if(!country || country.toString().length < 4  || country.toString().length > 10) errors['country'] = 'Please provide a valid country'
    if(!zip || zip.toString().length < 4  || zip.toString().length > 10) errors['zip'] = 'Please provide a valid zip code'
    return errors
}
  
exports.makeErrorResponse = (validation_test)=>{
    let error_message
    Object.keys(validation_test).forEach(key=>{
      error_message += `${key}:${validation_test[key]}|`
    })
    return error_message
}

exports.validateMessage = (subject,message) => {
    const errors = {}
    if(!subject || subject.toString().length < 2 || subject.toString().length > 20) errors['subject'] = 'Subject field should be between 2 and 20 characters' 
    else subject = subject.trim()
    if(!message || message.toString().length < 2 || message.toString().length > 1500) errors['message'] = 'Message field should be between 2 and 1500 characters' 
    else message = message.trim()
    return {errors,subject,message}
}