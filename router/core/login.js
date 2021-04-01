const express = require('express')

const router = express.Router()

const authControllers = require('../../controllers/auth')

router.get('/login',authControllers.getLogin)
router.get('/register',authControllers.getRegister)
router.post('/login',authControllers.postLogin)
router.post('/register',authControllers.postRegister)
router.get('/logout',authControllers.getLogout)
module.exports = router 