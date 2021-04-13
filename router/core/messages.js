const isAuth = require('../../middleware/auth')
const express = require('express')
const router = express.Router()
const messageControllers = require('../../controllers/messages')


router.get('/messages',isAuth,messageControllers.getMessagePage)
router.get('/messages/ajax',isAuth,messageControllers.getMessagesAjax)
router.get('/messages/discussion/:message_id',messageControllers.getChat)
router.post('/messages/send/chat/ajax',isAuth,messageControllers.sendMessageChat)
router.post('/messages/send/ajax',isAuth,messageControllers.sendMessage)
router.post('/messages/discussion/:parentId',messageControllers.closeDiscussion)

module.exports = router 