const router = require('express').Router()
const dashboardControllers = require('../../controllers/dashboard')


router.get('/dashboard',dashboardControllers.getDashboard)
router.get('/dashboard/reports',dashboardControllers.getReports)
router.get('/dashboard/products',dashboardControllers.getProducts)
router.get('/dashboard/products/ajax',dashboardControllers.getProductsAJAX)
router.get('/dashboard/product/:product_id/bids',dashboardControllers.getBids)
router.get('/dashboard/orders',dashboardControllers.myOrderPage)
router.get('/dashboard/orders/ajax',dashboardControllers.myOrderPageAjax)
router.get('/dashboard/product/:product_id',dashboardControllers.productDetails)
router.post('/dashboard/product/:product_id/createOrder',dashboardControllers.makeProductSold)
router.post('/dashboard/create-product',dashboardControllers.createProduct)
router.post('/dashboard/delete-product',dashboardControllers.deleteProduct)
router.post('/dashboard/update-product',dashboardControllers.updateProduct)
module.exports = router 