function createAccount(){
	window.location = "createAccount.html";
}

function goToProfile(){
  window.location = "profile.html";
}

// function loginUser(){
// 	var privateLoginKey = $("#privateLoginKey").val();

// 	var accountKeys = JSON.parse(localStorage.accountKeys);

// 	if(accountKeys.mnemonic == privateLoginKey){
// 		window.location = "home.html";
// 	}

// 	else{

// 		alert("Wrong Key");
// 	}
// }

function login(){
	localStorage.clear();
	var privateSeed = $("#privateSeed").val();

	var keys = getKeyPair(privateSeed);

	var user = {
		"publicKey":keys.publicKey,
		"privateKeyHash":keys.privateKeyHash
	};


	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/login_user',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
         if(response.data){
         	localStorage.setItem("accountKeys",JSON.stringify(keys));
         	window.location = "index.html";
         } 
        },
        error: function () {
           
        }
    });
}

function logoutUser(){
	localStorage.clear();
	window.location = "register.html";
}

var userFriends = [];
var friendsCount = 0;

function addFriend(){
	var publicKey = $("#addFriend").val();
	var user  =  {
  		"user_public_key":publicKey
		};


	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/fetch_user_public_key',
        type:'GET',
        data: user ,
        dataType : "json",
        success: function (response) {
          if(response.data)  {
          	userFriends.push(response.data.user_public_key);
          	friendsCount++;

          	 if(friendsCount <=3){
          	 document.getElementById("friendsList").innerHTML +=   '<div class="card-panel">'+
            '<span id="friendsPublicKey" class="blue-text text-darken-2">'+response.data.user_public_key+'</span>'+
          '<br />Added</div>';

          	 }

          	if(friendsCount == 3) {
          	console.log(userFriends);
			   localStorage.setItem("userFriends",JSON.stringify(userFriends));
				 document.getElementById("friendsList").innerHTML += '<a onclick="sendSecret()" class="waves-effect waves-light btn-large">Send Secret</a>';
			}
          }
          
        },
        error: function () {
           
        }
    });



}

function Friend(){
	var publicKey = $("#addFriend").val();
	var user  =  {
  		"user_public_key":publicKey
		};


	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/fetch_user_public_key',
        type:'GET',
        data: user ,
        dataType : "json",
        success: function (response) {
          if(response.data)  {
			userFriends.push(response.data.user_public_key);
          	friendsCount++;

          	 if(friendsCount <=3){
          	 	 document.getElementById("friendsList").innerHTML += '<div class="card-panel">'+
            '<span id="friendsPublicKey" class="blue-text text-darken-2">'+response.data.user_public_key+'</span>'+
          '<br />Added</div>';

          	 }

          	if(friendsCount == 3) {
			localStorage.setItem("userFriends",JSON.stringify(userFriends));
			  document.getElementById("friendsList").innerHTML += '<a onclick="sendSecretRequest()" class="waves-effect waves-light btn-large">Send Secret</a>';
      }
          }
          
        },
        error: function () {
           
        }
    });



}



//function to send secret to friends

function sendSecret(){
	/**
	trustData = [
	{
		"user_id":user_id,
		"encrypted_key_data":data
	},
	{
		"user_id":user_id,
		"encrypted_key_data":data
	},
	{
		"user_id":user_id,
		"encrypted_key_data":data
	}
	];
	**/

	var userFriends = JSON.parse(localStorage.userFriends);

	var secretShares = getSecretParts();

	var trustData = [];

	for(i=0 ; i<3 ; i++){
		var dataObject = {};
		dataObject.user_public_key = userFriends[i];
		dataObject.encrypted_key_data = getEncrytedKeydata(userFriends[i],secretShares[i]);
		trustData.push(dataObject);
	}

	var  user = {
		"trust_data":trustData
	};

	console.log(user);

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/user_trust_data',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
           document.getElementById("secretResult").innerHTML = "<br />Shared Successfully!!";
           localStorage.setItem("friendsAdded",1);

           setTimeout(function(){
           	window.location = "index.html";
           },1500);
        },
        error: function () {
           
        }
    });
}


//function to send otp  through email

function sendOtp(){
	var email = $('#email').val();

	var  user = {
		"user_email":email
	};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/send_otp',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
           if(response.session_id){
           	 localStorage.setItem("session_id",response.session_id);
           	 localStorage.setItem("email",email);
             localStorage.setItem("otp",response.otp);
           } 
           window.location = "verify.html";
        },
        error: function () {
           
        }
    });

}

//function to send otp  through email

function sendRecoveryOtp(){
	var email = $('#email').val();

	var  user = {
		"user_email":email
	};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/send_recovery_otp',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
           if(response.session_id){
           	 localStorage.setItem("session_id",response.session_id);
           	 localStorage.setItem("email",email);
             localStorage.setItem("otp",response.otp);
           } 
           window.location = "verifyRecovery.html";
        },
        error: function () {
           
        }
    });

}

function verifyOtp(){
	var otp = $('#otp').val();

	var accountKeys = JSON.parse(localStorage.accountKeys);

	var  user = {
		"otp":localStorage.otp,
		"session_id":localStorage.session_id,
		"email":localStorage.email,
		"publicKey":accountKeys.publicKey
	};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/verify_otp',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
           localStorage.setItem("userDetails", JSON.stringify(response.userDetails));
           localStorage.setItem("emailVerified",1);
           window.location = "friends.html";
        },
        error: function () {
           
        }
    });

}

function verifyRecoveryOtp(){
	var otp = $('#otp').val();

	var  user = {
		"otp":localStorage.otp,
		"session_id":localStorage.session_id,
		"email":localStorage.email
	};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/verify_recovery_otp',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
        	localStorage.setItem("accountDetails",JSON.stringify(response.userDetails));

        	var newAccountKeys = getNewKeys();

			localStorage.setItem("newAccountKeys",JSON.stringify(newAccountKeys));

			window.location = "addFriends.html";
          
        },
        error: function () {
           
        }
    });

}

// //function to send secret to friends

function sendSecretRequest(){
	/**
	trustData = [
	{
		"user_id":user_id,
		"encrypted_key_data":data
	},
	{
		"user_id":user_id,
		"encrypted_key_data":data
	},
	{
		"user_id":user_id,
		"encrypted_key_data":data
	}
	];
	**/

	var userFriends = JSON.parse(localStorage.userFriends);
	var newAccountKeys =  JSON.parse(localStorage.newAccountKeys);
	var accountDetails =  JSON.parse(localStorage.accountDetails);

	var trustData = [];

	for(i=0 ; i<3 ; i++){
		var dataObject = {};
		dataObject.user_public_key = userFriends[i];
		trustData.push(dataObject);
	}

	var  user = {
		"publicKey":accountDetails.user_public_key,
		"newPublicKey":newAccountKeys.publicKey,
		"trust_data":trustData
	};

	console.log(newAccountKeys.privateKey);

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/user_recovery_trust_data',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
           window.location = "request.html";

  
        },
        error: function () {
           
        }
    });
}



