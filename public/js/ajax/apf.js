function loadDoc(page=1,view=24,meta={}) {
    var xhttp = new XMLHttpRequest();
 

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById('loading').style.display = "none"
        document.getElementById("productTable").innerHTML = this.responseText 
      }else if (this.readyState == 4 && this.status == 404) {
        document.getElementById('loading').style.display = "none"
        document.getElementById("productTable").innerHTML = this.responseText 
      }else{
          document.getElementById('loading').style.display = "flex"
      }
    };
    xhttp.open("GET", `/dashboard/products/ajax?page=${page}&view=${view}`, true);
    // xmlhttp.setRequestHeader("authorization", );
    xhttp.send();
  }



  function loadCategories(supercategory,name,page=1,view=24,meta={}) {
    var xhttp = new XMLHttpRequest();
  
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById('loading').style.display = "none"
        document.getElementById(`categories-${name}`).innerHTML = this.responseText;
      }else if (this.readyState == 4 && this.status == 404) {
        document.getElementById('loading').style.display = "none"
        document.getElementById(`categories-${name}`).innerHTML = this.responseText+temp;
      }else{
          document.getElementById('loading').style.display = "flex"
      }
    };
    xhttp.open("GET", `/categories-by-super-ajax?supercategory=${supercategory}`, true);
    // xmlhttp.setRequestHeader("authorization", );
    xhttp.send();
  }

  function loadProducts(category,page=1,view=24,meta={}) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById('loading').style.display = "none"
        document.getElementById("products").innerHTML = this.responseText;
      }else if (this.readyState == 4 && this.status == 404) {
        document.getElementById('loading').style.display = "none"
        document.getElementById("products").innerHTML = this.responseText;
      }else{
          document.getElementById('loading').style.display = "flex"
      }
    };
    xhttp.open("GET", `/shop/products-by-category-ajax/${category}?page=${page}&view=${view}`, true);
    // xmlhttp.setRequestHeader("authorization", );
    xhttp.send();
  }


  function ajaxLogin(){
    var loginLoading = `
      <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
      </div>
    `
    // var formData = new  FormData()
    // formData.append('email',document.getElementById('email').value)
    // formData.append('password',document.getElementById('password').value)
    // formData.append('isAjax',true)
    var email = document.getElementById('email').value 
    var password = document.getElementById('password').value 
    var isAjax = true 
    var data = JSON.stringify({email,password,isAjax})
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      console.log(this.status)
      if (this.readyState == 4 && this.status == 201) {
        document.getElementById('loginBtn').innerHTML = "Login Succeed!"
         setTimeout(function(){
            location.reload();
         },1000)
      }else if (this.readyState == 4 && this.status == 400) {
        document.getElementById('loginBtn').innerHTML = "Login"
         
      }else{
        document.getElementById('loginBtn').innerHTML = loginLoading
      }
    };
    xhttp.open("POST", `/login`, true);
    // xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(data);
  }


  function loadOrders(page=1,view=24,status=null,meta={}) {
    var xhttp = new XMLHttpRequest();
    // let temp =  document.getElementById("orderTable").innerHTML
    document.getElementById("orderTable").style = "none"
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById('loading').style.display = "none"
        document.getElementById("orderTable").style = "block"
        document.getElementById("orderTable").innerHTML = this.responseText ;
      }else if (this.readyState == 4 && this.status == 404) {
        document.getElementById("orderTable").style = "block"
        document.getElementById('loading').style.display = "none"
        document.getElementById("orderTable").innerHTML = this.responseText ;
      }else{
          document.getElementById("orderTable").style = "none"
          document.getElementById('loading').style.display = "flex"
      }
    };
    if(!status)
      xhttp.open("GET", `/dashboard/orders/ajax?page=${page}&view=${view}`, true);
    else 
      xhttp.open("GET", `/dashboard/orders/ajax?page=${page}&view=${view}&status=${status}`, true);
    xhttp.send();
  }