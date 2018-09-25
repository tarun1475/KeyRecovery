function checkUser(){
    if(localStorage.request_id != undefined) window.location = "request.html";

    if(localStorage.accountKeys == undefined){
        window.location = "register.html";

    }
}

function fetchRecoveryRequest(){
	
	var accountDetails =  JSON.parse(localStorage.accountDetails);

	var user  =  {
  		"publicKey":accountDetails.user_public_key
		};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/fetch_recovery_trust_data',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
            var count = 0;

            localStorage.setItem("request_id",response.result[0].request_id);

            console.log(response);
             document.getElementById("recoveryRequestDetails").innerHTML = '<div><b>Request Id: </b>'+response.result[0].request_id+'</p></div>';
             var secrets = [];
            for(m = 0 ; m < response.result.length  ; m++){
                var approved = "";
                if(response.result[m].trust_data) {
                count++;
                var trustData = getRecoveryDecrypteddata(response.result[m].trust_data);
                approved = 'Approved Status: Done!'; 
                secrets.push(trustData);
                }
                else {
                    approved = 'Not Approved Yet';
                }

                document.getElementById("recoveryRequestDetails").innerHTML +='<div class="card"><div class="card-content">'+

                      '<p id="friendsPublicKey">User: ' + response.result[m].user_public_key + '</p><br />' +
                      'Date: ' + response.result[m].logged_on.substring(0,10) + '<br />'+
                      approved+
                      '</div></div>';

            }
        	// var secrets = [];

        	// for(i = 0 ; i < response.result.length; i++){

        	// 	var trustData = getRecoveryDecrypteddata(response.result[i].trust_data);
        	// 	secrets.push(trustData);
        	// }
        	 

             if(count >= 3) {
                var secretRecovery = getOriginalMnemonic(secrets);
                document.getElementById("recoveryRequestDetails").innerHTML = '<div class="card"><div class="card-content">'+
                      '<h3>Mnemonic</h3> <br />'+'<b>You have successfully recovered your mnemonic phrase!</b> <br />'+
                      secretRecovery+
                      '</div></div>';
             }

        	 
        },
        error: function () {
           
        }
    });


}




function getTrustRequests(){
	var accountKeys = JSON.parse(localStorage.accountKeys);

	var user  =  {
  		"publicKey":accountKeys.publicKey
		};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/fetch_recovery_data',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
            console.log(response);
            if(response.status == 0 || response.recoveryData.length == 0){
                document.getElementById("trustDetails").innerHTML +='<div class="card"><div class="card-content">'+
                      '<h4>No Requests Found!</h4>'+
                      '</div></div>';
            }

            else {
        	var trustData = [];
        	var requestRecovery = [];

        	for(i = 0 ; i < response.trustData.length ; i++){

        		var data = getDecrypteddata(response.trustData[i].trust_data);
            	data = JSON.parse(data);
            	trustData.push(data);


        	}



        	for(j = 0 ; j < response.recoveryData.length ; j++){
                var k = 0;
        		while(k < trustData.length){
        			var recoveryDetails = {};
        			if(response.recoveryData[j].from_public_key == trustData[k].user_public_key) {
                        var trust_data 					=   getEncrytedRecoverydata(response.recoveryData[j].new_public_key , trustData[k].secret );
        				recoveryDetails.request_id      =	response.recoveryData[j].request_id;
        				recoveryDetails.from_public_key =   response.recoveryData[j].from_public_key;
        				recoveryDetails.new_public_key  =   response.recoveryData[j].new_public_key;
        				recoveryDetails.secret			=   trust_data;
        				recoveryDetails.logged_on		=   response.recoveryData[j].logged_on;
                        
                         requestRecovery.push(recoveryDetails);
        			}

                    k++;
        		}

        		
        	}
        	for(m = 0 ; m < requestRecovery.length  ; m++){

        		localStorage.setItem("requestRecovery",JSON.stringify(requestRecovery));

        		document.getElementById("trustDetails").innerHTML +='<div class="card"><div class="card-content">'+
			          'Request Id: ' + requestRecovery[m].request_id  + '<br />' +
			          '<p id="friendsPublicKey">From User: ' + requestRecovery[m].from_public_key + '</p><br />' +
			          'Date: ' + requestRecovery[m].logged_on.substring(0,10) + '<br />'+
			          '<a onclick="approveRecovery('+ m +')" class="waves-effect waves-light btn-large">Approve</a>'+
                      '<div id="approveResult"></div>'+
			          '</div></div>';

        	}
        }

        },
        error: function () {
           
        }
    });


}


function approveRecovery(m){
	var requestRecovery = JSON.parse(localStorage.requestRecovery);
	var accountKeys     = JSON.parse(localStorage.accountKeys);

	var user = {
		"publicKey": accountKeys.publicKey,
		"request_id":requestRecovery[m].request_id,
		"trust_data":requestRecovery[m].secret
	};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/update_recovery_trust_data',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
            document.getElementById("approveResult").innerHTML = "Approved";
            window.location = "";
        },
        error: function () {
           
        }
    });

}



function generateKeys(){
	var accountKeys = mnemonic();

	localStorage.setItem("accountKeys",JSON.stringify(accountKeys));

	var user  =  {
  		"user_public_key":accountKeys.publicKey,
  		"user_private_key_hash":accountKeys.privateKeyHash
		};

	 $.ajax({
        url: 'http://159.65.153.3:7001/recovery_key/register_user',
        type:'POST',
        data: user ,
        dataType : "json",
        success: function (response) {
            document.getElementById("mnemonic").innerHTML =   '<div class="card-panel">'+
            '<span class="blue-text text-darken-2">'+ accountKeys.mnemonic+'</span>'+
          '</div>';
        },
        error: function () {
           
        }
    });

	


}

 