var socket = io('ws://localhost:8000',{
    transports: ['websocket']
});

var  _id = null
var to = null
function joinChat(user_id) {
    _id = user_id
    socket.emit('join-chat',{
        user_id
    })
}

socket.io.on("reconnect", () => {
    joinChat(_id)
 });
 
 socket.on("connect_error", () => {
   setTimeout(() => {
    joinChat(_id)
   }, 1000);
 })

 socket.on('close-discussion',function(){
   document.getElementById('alert-modal').click()
   var x = 4
   var y = setInterval(function(){
     x = x-1
    if(x>-1)
    document.getElementById('timer-redirect').innerHTML = x 
    if(x==-1) {
      window.location.replace("/messages");
      clearInterval(y)
    }
   },1000)
 })

socket.on('new-message',function(data){
  var discussion = document.getElementById('chat-messages').innerHTML
  let build_li = `
  <li class="left clearfix p-2 shadow" style="border-radius: 20px;">
    <span class="chat-img pull-left">
      <img src="/${data.user.profile_img}" alt="User Avatar">
    </span>
    <div class="chat-body clearfix bg-light shadow-sm" style="border-radius:20px;">
        <div class="header">
            <strong class="primary-font">${data.user.name} ${data.user.last_name}</strong>
            <small class="pull-right text-muted"><i class="fa fa-clock-o"></i> ${new Date(data.newMessage.createdAt).toUTCString()}</small>
        </div>
        <p style="word-wrap: break-word;font-size:15px;">
          ${data.newMessage.message}
        </p>
    </div>
  </li>`
        document.getElementById('chat-messages').innerHTML = discussion + build_li
        document.getElementById("message-area").value = ""
        document.getElementById('message-overflow-container').querySelector('#scroll').scrollIntoView({behavior:'smooth'})
})

 function sendMessage(from=_id,_to=null,parentId=null,selector='sendBtn',formSelector='messageForm') {
    var discussion = document.getElementById('chat-messages').innerHTML
    var xhttp = new XMLHttpRequest();
 
    var form = document.getElementById(formSelector)
    var data = {}
    for(let i=0;i<form.elements.length;i++) {
        data[form.elements[i].name] = form.elements[i].value
    }
    if(from) data.from = from
    data['to'] = _to;
    data['parentId'] = parentId
    data = JSON.stringify(data)
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 201) {
        document.getElementById('sendBtn').innerHTML = `${icon}`
        let response = JSON.parse(this.response)
         
        let build_li = `
        <li class="left clearfix p-2 shadow" style="border-radius: 20px;">
          <span class="chat-img pull-left">
            <img src="/${response.user.profile_img}" alt="User Avatar">
          </span>
          <div class="chat-body clearfix bg-light shadow-sm" style="border-radius:20px;">
              <div class="header">
                  <strong class="primary-font">${response.user.name} ${response.user.last_name}</strong>
                  <small class="pull-right text-muted"><i class="fa fa-clock-o"></i> ${new Date(response.newMessage.createdAt).toUTCString()}</small>
              </div>
              <p style="word-wrap: break-word;font-size:15px;">
                ${response.newMessage.message}
              </p>
          </div>
        </li>`
        document.getElementById('chat-messages').innerHTML = discussion + build_li
        document.getElementById("message-area").value = ""
        document.getElementById('message-overflow-container').querySelector('#scroll').scrollIntoView({behavior:'smooth'})
      }else if (this.readyState == 4 && this.status == 422) {
        document.getElementById('sendBtn').innerHTML = `${icon}`
        document.getElementById("message-area").value = ""
        document.getElementById('errorMsg').innerHTML = 'Message failed to be sent.Maybe the receiver closed this discussion'
        document.getElementById('errorMsg').style.display = 'block'
      }else{
        document.getElementById('sendBtn').innerHTML = `${LOADING}`
      }
    };
    xhttp.open("POST", `/messages/send/chat/ajax`, true);
    // xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(data);
  }
 


  window.addEventListener('load',function(){
     document.getElementById('message-overflow-container').querySelector('#scroll').scrollIntoView({behavior:'smooth'})
  })
 
 