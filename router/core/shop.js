const router = require('express').Router()
const shopCoreControllers = require('../../controllers/shop')


router.get("/shop/supercategory/:super_id/:super_name",shopCoreControllers.getSupercategoryPage)
router.get('/',shopCoreControllers.getHomePage)
router.get('/categories-by-super-ajax',shopCoreControllers.getAjaxCategoryBySuper)
router.get('/category/:category_name',shopCoreControllers.getCategoryPage)
router.get('/shop/products-by-category-ajax/:category_id',shopCoreControllers.getProductsAjax)
router.get('/product/bid/:product_id',shopCoreControllers.getBidPage)
router.post('/place-bid',shopCoreControllers.bidProduct)

module.exports = router 