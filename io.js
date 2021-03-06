const http = require('./index');
const io = require('socket.io')(http);

io.on('connection',(socket)=>{
 
    socket.on('join',({product_id})=>{
       
        socket.join(product_id)
    })
    socket.on('join-chat',({user_id})=>{
        
        socket.join(user_id)
    })
    socket.on('disconnect',()=>{
     
        socket.leave()
    })
})


module.exports = io
