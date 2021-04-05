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
        view
    }
}