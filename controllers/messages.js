const Message = require('../models/Message');
const User = require('../models/User');
const {validateMessage} = require('../utils/utils')
const app = require('../app')


exports.sendMessage = async (req,res,next) => {
    try {
        let newMessage;
        let {subject,message,to,from,isResponse} = req.body 
        let validationObj = validateMessage(subject,message)
        const _to = await User.findById(to)
        if(!_to){
            throw new Error('User not found')
        }
        if(from != req.session.user._id){
            throw new Error('User not found')
        }
        if(Object.keys(validationObj.errors).length > 0 ) {
            req.session.setError = true 
            return res.status(422).json({
                ...validationObj.errors
            })
        }
        subject = validationObj.subject
        message = validationObj.message
 
        if(!isResponse) {
            newMessage = await new Message({subject,message,to,from,isResponse:false}).save()
            return res.status(201).json({
                newMessage
            })
        }else {
            let parentId = req.body.parentId
            if(!parentId) throw new Error('Message was not sent')
            const parentMessage = await Message.findById(parentId)
            if(!parentMessage) throw new Error('Message was not sent')
            newMessage = await new Message({subject,message,to,from,isResponse:true,parentId}).save()
            parentMessage.responses.push(newMessage)
            await parentMessage.save()
            return res.status(201).json({
                newMessage,
            })
        }
    } catch (error) {
        console.log(error)
        res.status(422).json({
            error:'Failed to send message'
        })
    }
}

exports.sendMessageChat = async (req,res,next) => {
    try {
        let newMessage;
        let {subject,message,to,from,isResponse,parentId} = req.body 
        if(!parentId) throw new Error('No such discussion')
        subject = `New`
        let validationObj = validateMessage(subject,message)
        const _to = await User.findById(to)
        if(!_to){
            throw new Error('User not found')
        }
        delete _to.password
        if(from != req.session.user._id){
            throw new Error('User not found')
        }
        if(Object.keys(validationObj.errors).length > 0 ) {
            req.session.setError = true 
            return res.status(422).json({
                ...validationObj.errors
            })
        }
        subject = validationObj.subject
        message = validationObj.message
        if(!parentId) throw new Error('Message was not sent')
        const parentMessage = await Message.findOne({status:false,_id:parentId})
        if(!parentMessage) throw new Error('Message was not sent')
        newMessage = await new Message({subject,message,to,from,isResponse:true,parentId}).save()
        parentMessage.responses.push(newMessage)
        await parentMessage.save()
        let socketResponse = {
            user: {
                name:req.session.user.name,
                last_name:req.session.user.last_name,
                profile_img:req.session.user.profile_img
            },
            newMessage: newMessage
        }
        let receiver = req.session.user._id == parentMessage.from ? parentMessage.to : parentMessage.from  
        app.get('io').to(`${receiver}`).emit('new-message',socketResponse)
        return res.status(201).json({
            newMessage,
            user:{
                profile_img:req.session.user.profile_img,
                name:req.session.user.name,
                last_name:req.session.user.last_name
            }
        })
    } catch (error) {
 
        res.status(422).json({
            error:'Failed to send message'
        })
    }
}

exports.getMessagePage = async (req,res,next) => {
    res.render('admin/messagePage')
}

exports.getChat = async (req,res,next) => {
    let discussionError;
    let discussionMessage;
    try {
        if(req.query.discussionMessage && req.session.setError) {
            discussionMessage = req.query.discussionMessage 
        }
        if(req.query.discussionError && req.session.setError) {
            discussionError = req.query.discussionError 
        }
        const messages = await Message.findOne({_id:req.params.message_id,isResponse:false,parentId:null}).or([{to:req.session.user._id},{from:req.session.user._id}]).populate('to','name last_name email profile_img').populate('from','name last_name email profile_img').populate({
            path:'responses',
            model:'Message',
            populate:{
                path:'from',
                model:'User',
                select:'name last_name profile_img email'
            }
        }).sort({'createdAt':-1})
        req.session.setError = false
        if(!messages) throw new Error()
        res.status(200).render('admin/chat',{messages,discussionError,discussionMessage})
    } catch (error) {
        res.redirect('/messages')
    }
}

exports.getMessagesAjax = async (req,res,next) => {
    try {
        let status = req.query.status || false 
        let page = parseInt(req.query.page) || 1
        let view = parseInt(req.query.view) || 10
        let hasNext = true
        if(view !== 10 ) view = 10
        const totalMessages = await Message.countDocuments({isResponse:false}).or([{to:req.session.user._id},{from:req.session.user._id}])
        let limit = Math.ceil(totalMessages/view)
        if(page < 1) page = 1
        if(page > limit) page = limit
        if (page == limit) hasNext = false
        let skip = (page-1) * view 
        const messages = await Message.find({isResponse:false}).or([{to:req.session.user._id},{from:req.session.user._id}]).populate('to','name last_name email profile_img').populate('from','name last_name email profile_img').populate({
            path:'responses',
            model:'Message',
            populate:{
                path:'from',
                model:'User',
                select:'name last_name profile_img email'
            }
        }).limit(view).skip(skip).sort({'createdAt':-1})
        if(!messages) throw new Error('No messages at the moment')
        if(page === 1)
            return res.render('ajax/messages',{messages,totalMessages,page,view,limit})
        else {
            return res.status(200).json({
                messages,
                totalMessages,
                page,
                view,
                limit,
                hasNext
            })
        }
        res.status(200).json({
            messages
        })
    } catch (error) {
        return res.status(404).send("<p class='alert alert-primary'>You have no messages at the moment</p>")
        res.status(404).json({
            error:'No messages at the moment'
        })
    }
}


exports.closeDiscussion = async (req,res,next) => {
    try {
        const parentId = req.params.parentId 
        const discussion = req.body.discussion
        if(parentId != discussion) throw new Error('')
        const message = await Message.findOne({_id:discussion,isResponse:false,parentId:null,status:false}).or([{to:req.session.user._id},{from:req.session.user._id}])
        if(!message) throw new Error('')
        message.status = true
        await message.save()
        let alertReceiver;
        if(message.from == req.session.user._id) {
            alertReceiver = message.to
        }else{
            alertReceiver = message.from
        }
        app.get('io').to(`${alertReceiver}`).emit('close-discussion')
        req.session.setError = true
        return res.redirect(`/messages/discussion/${discussion}?discussionMessage=Discussion closed successfully`)
    } catch (error) {
        console.log(error)
        req.session.setError = true
        return res.redirect(`/messages/discussion/${req.body.discussion}?discussionError=Discussion failed to close`)
    }
}