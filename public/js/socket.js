 

var socket = io('ws://localhost:8000',{
    transports: ['websocket']
});
var bidGlobal = {
    lables:[],
    data:[],
    currency:'euro'
}

var chart = null
var  _id = null
socket.on('new_evaluation',(data)=>{
    let jsonResponse = data
    document.getElementById('evaluate').innerHTML = jsonResponse.end_price
    bidGlobal.data.push(jsonResponse.user.bid.price)
    bidGlobal.labels.push(jsonResponse.user.bid.createdAt)

    // bidGlobal = setGlobalBid( bidGlobal.data , bidGlobal.labels ,jsonResponse.user.bid.currency.symbol)
    chart.data.labels.push(jsonResponse.user.bid.createdAt);
    chart.data.datasets.forEach((dataset) => {
        dataset.data = bidGlobal.data 
    });
    
    chart.update();
    setLastBidder(jsonResponse.user)
})
socket.io.on("reconnect", () => {
   joinProduct(_id)
});
socket.on("connect_error", () => {
  setTimeout(() => {
   joinProduct(_id)
  }, 1000);
})

function setGlobalBid(data){
      
    return {data:data.map((d)=>d.price),labels:data.map((d)=>d.createdAt),currency:data.length>0 ? data.currency : 'euro'}
  }


function joinProduct(product_id){
    _id = product_id
    socket.emit('join',{
        product_id
    })
}

function setBid(product_id,user_id,name,last_name){
    try {
        var value = document.getElementById('bid').value
        value = parseFloat(value)
        if(!value) throw new Error('Invalid value format')
        var build_obj =  {product_id,end_price:value,user:{user_id,name,last_name}}
        sendBid(build_obj)
    } catch (error) {
      
    }
}

function sendBid(obj){
    var bidLoading = `
    <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
    </div>
  `
    try {
        let preventRequest = parseFloat(document.getElementById('evaluate').textContent).toFixed(2)
        if(parseFloat(obj.end_price)  <= parseFloat(preventRequest)) {
            document.getElementById('error-bid').innerHTML = `Price should be more than ${preventRequest}`
            document.getElementById('error-modal-toggle').click()
            setTimeout(()=>{
                document.getElementById('close-error-modal').click()
          },2000)
          return
        }
    } catch (error) {
       return
    }
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
    
      if (this.readyState == 4 && this.status == 201) {
        document.getElementById('bidBtn').innerHTML = "Bid Placed!"
        document.getElementById('bidBtn').classList.remove('btn-outline-dark')
        document.getElementById('bidBtn').classList.add('btn-outline-success')
        document.getElementById('bidBtn').disabled = true
        document.getElementById('success-bid').innerHTML = 'Well done! Your bid has been placed!'
        document.getElementById('success-modal-toggle').click()
        nextBidAllowed(60)
        setTimeout(()=>{
              document.getElementById('close-success-modal').click()
        },2000)
        
      }else if (this.readyState == 4 && this.status == 404) {
        document.getElementById('bidBtn').innerHTML = "Submit"
        document.getElementById('error-bid').innerHTML = this.responseText
        document.getElementById('error-modal-toggle').click()
        setTimeout(()=>{
              document.getElementById('close-error-modal').click()
        },2000)
      }else{
        document.getElementById('bidBtn').innerHTML = bidLoading
      }
    };
    xhttp.open("POST", `/place-bid`, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    obj = JSON.stringify(obj)
    xhttp.send(obj);
}

var bidInterval;
function nextBidAllowed(last_bid) {
        let now 
        let user_bid
        if(last_bid === 60 )
          now = 0
        else
          now = new Date().getTime() / 1000
        
 
        user_bid = new Date(last_bid).getTime() / 1000
     
        document.getElementById('show-time-interval').style.display = 'block'
        bidInterval = setInterval(function(){
        now +=1
        let check_action =  now - user_bid
        let timer = 60-  Math.abs(parseInt(check_action ))
        document.getElementById('show-time-interval').innerHTML = `You can bid in :${timer} seconds`  
        if( (check_action > 0 && check_action > 60) || (check_action < 0 && check_action < 60)) {
            setTimeout(()=>{
                document.getElementById('bidBtn').disabled = false 
                document.getElementById('bidBtn').innerHTML = "Submit"
                document.getElementById('bidBtn').classList.remove('btn-danger')
                document.getElementById('bidBtn').classList.add('btn-success')
                document.getElementById('show-time-interval').style.display = 'none'
            },2000)
            document.getElementById('show-time-interval').innerHTML = 'You can bid again!'
            clearInterval(bidInterval)
        }
    },1000) 
}


function disableBtnSinceLastBid(last_bid){
    try {
 
        let create_date = new Date().getTime() / 1000
        let user_last_bid = new Date(last_bid).getTime() / 1000
        let subtract_time = parseInt(Math.abs(create_date - user_last_bid))
         
        if(subtract_time  - 60 < 0){
            document.getElementById('bidBtn').disabled = true 
            nextBidAllowed(last_bid)
        }
    } catch (error) {
     
    }
}


Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

 
function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}
function setChart(labels=[],data=[],currency="€"){
// Area Chart Example
var ctx = document.getElementById("myAreaChart");
  chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels.map(l=>new Date(l).toUTCString().split(",")[1].split("GMT")[0]),
    datasets: [{
      label: "Bids",
      lineTension: 0.3,
      backgroundColor: "rgba(78, 115, 223, 0.05)",
      borderColor: "rgba(78, 115, 223, 1)",
      pointRadius: 3,
      pointBackgroundColor: "rgba(78, 115, 223, 1)",
      pointBorderColor: "rgba(78, 115, 223, 1)",
      pointHoverRadius: 3,
      pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
      pointHoverBorderColor: "rgba(78, 115, 223, 1)",
      pointHitRadius: 10,
      pointBorderWidth: 2,
      data: data,
    }],
  },
  options: {
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 10,
        right: 25,
        top: 25,
        bottom: 0
      }
    },
    scales: {
      xAxes: [{
        time: {
          unit: 'date'
        },
        gridLines: {
          display: true,
          drawBorder: true
        },
        ticks: {
          maxTicksLimit: data.length + 1  
        },
        callback: function(value) {
          return new Date(value).toUTCString();
        }
      }],
      yAxes: [{
        ticks: {
          maxTicksLimit: data.length,
          padding: 10,
          // Include a dollar sign in the ticks
          callback: function(value, index, values) {
            return currency + value;
          }
        },
        gridLines: {
          color: "rgb(234, 236, 244)",
          zeroLineColor: "rgb(234, 236, 244)",
          drawBorder: true,
          borderDash: [2],
          zeroLineBorderDash: [2]
        }
      }],
    },
    legend: {
      display: false
    },
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      titleMarginBottom: 10,
      titleFontColor: '#6e707e',
      titleFontSize: 14,
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      intersect: false,
      mode: 'index',
      caretPadding: 10,
      callbacks: {
        label: function(tooltipItem, chart) {
          var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
          return datasetLabel + ': '+currency + tooltipItem.yLabel;
        }
      }
    }
  }
});
}


function setLastBidder(user){
  document.getElementById('last_bidder').innerHTML = `${user.name} ${user.last_name}`
  document.getElementById('last_bidder_date').innerHTML = new Date(user.bid.createdAt).toUTCString()
  console.log(user.profile_img)
  document.getElementById('last_bidder_profile_img').src  = `/${user.profile_img}`
} 