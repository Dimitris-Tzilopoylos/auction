var LOADING = `
      <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
      </div>
    `
var icon = '<i class="fa fa-paper-plane" aria-hidden="true"></i>'
var currPage = 1
var flag = true
var view = 10

function sendMessage(from=null,to=null,isResponse=false,parentId=null,selector='sendBtn',formSelector='messageForm') {
    var xhttp = new XMLHttpRequest();
    // let temp =  document.getElementById("orderTable").innerHTML
    // document.getElementById("userTable").style = "none"
    var form = document.getElementById(formSelector)
    var data = {}
    for(let i=0;i<form.elements.length;i++) {
        data[form.elements[i].name] = form.elements[i].value
    }
    if(from) data.from = from
    data = JSON.stringify(data)
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 201) {
        document.getElementById('sendBtn').innerHTML = `Send ${icon}`
        // document.getElementById("userTable").innerHTML = this.responseText ;
      }else if (this.readyState == 4 && this.status == 422) {
        document.getElementById('sendBtn').innerHTML = `Send ${icon}`
      }else{
        document.getElementById('sendBtn').innerHTML = `${LOADING}`
      }
    };
    xhttp.open("POST", `/messages/send/ajax`, true);
    // xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(data);
  }


function buildList(data) {
    if(!data || Object.keys(data).length < 1) return
    var build_list = ``
    for(let i=0;i<data.messages.length;i++){
      build_list+=`
                <li class="bg-light shadow-sm my-4 card">
                	<a href="${'/messages/discussion/'+data.messages[i]._id}" class="clearfix">
                            <img src="/${data.messages[i].responses.length > 0 ? data.messages[i].responses[data.messages[i].responses.length - 1].from.profile_img : data.messages[i].from.profile_img}" alt="" class="img-circle">
                            <div class="friend-name">	
                                <strong>${data.messages[i].responses.length > 0 ? data.messages[i].responses[data.messages[i].responses.length - 1].from.name + " "+data.messages[i].responses[data.messages[i].responses.length - 1].from.last_name : data.messages[i].from.name + " "+data.messages[i].from.last_name}</strong>
                            </div>
                		    <div class="last-message text-muted" style="word-wrap: break-word;">${data.messages[i].responses.length > 0 ? data.messages[i].responses[data.messages[i].responses.length - 1].message : data.messages[i].message}</div>
                		    <small class="time text-muted">${data.messages[i].responses.length > 0 ? new Date(data.messages[i].responses[data.messages[i].responses.length - 1].createdAt).toUTCString() : new Date(data.messages[i].createdAt).toUTCString()}</small>
                		    <small class="chat-alert label label-danger">${data.messages[i].responses && data.messages[i].responses.length}</small>
						            <p class="badge badge-${data.messages[i].status ? 'danger' : 'success'} shadow-sm">${data.messages[i].status ? 'Closed' : 'Open'}</p>
                	</a>
                </li>`
    }
    return build_list
  }

  function getMessages(isClicked=false,page=1,view = 10) {
    if(!flag) return
    var xhttp = new XMLHttpRequest();
    document.getElementById("messageContainer").style.display = "none"
    if(isClicked) currPage ++
    if(isClicked && currPage == 1) return
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if(page == 1 && !isClicked){
        document.getElementById('loading').style.display = "none"
        document.getElementById("messageContainer").style.display = "block"
        document.getElementById("messageContainer").innerHTML = this.responseText ;
        }else {
          var populate = document.getElementById('populateMsg')
          var response = JSON.parse(this.response)
          if(flag){
            populate.innerHTML = populate.innerHTML + buildList(response)
          }else{
            document.getElementById("loadMsg").innerHTML = "No more discussions"
            document.getElementById("loadMsg").classList.remove('btn-primary')
            document.getElementById("loadMsg").classList.add('btn-light') 
            document.getElementById("loadMsg").disabled = true
          }
          if(!response.hasNext){
             flag= false
             document.getElementById("loadMsg").innerHTML = "No more discussions"
             document.getElementById("loadMsg").classList.remove('btn-primary')
             document.getElementById("loadMsg").classList.add('btn-light') 
             document.getElementById("loadMsg").disabled = true
          }
          document.getElementById('loading').style.display = "none"
          document.getElementById("loadMsg").innerHTML = "LOAD MORE"
          document.getElementById("loadMsg").scrollIntoView({behavior:'smooth'})
        }
      }else if (this.readyState == 4 && this.status == 404) {
        document.getElementById("messageContainer").style = "block"
        document.getElementById('loading').style.display = "none"
        document.getElementById("messageContainer").innerHTML = this.responseText ;
        if(isClicked){
          document.getElementById("loadMsg").innerHTML = "No more discussions"
          document.getElementById("loadMsg").classList.remove('btn-primary')
          document.getElementById("loadMsg").classList.add('btn-light') 
          document.getElementById("loadMsg").disabled = true
        }
      }else{
        if(isClicked)
            document.getElementById("loadMsg").innerHTML = LOADING
        else
          document.getElementById('loading').style.display = "flex"
        
        document.getElementById("messageContainer").style = "none"
      }
    };
 
      xhttp.open("GET", `/messages/ajax?page=${currPage}&view=${view}`, true);
 
    xhttp.send();
  }