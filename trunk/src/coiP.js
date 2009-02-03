var blockUI = true;

/* Show/hide the wait cursor 
 * or show a wait message */
function showWait(wait) {
	if (wait) {
		if (blockUI) {
			$.blockUI("<p><img src='images/busy.gif' /> <strong>Please wait...</strong></p> ");
		} else {
			$("*").css("cursor", "wait");
		}
	} else {
		if (blockUI) {
			$.unblockUI();
		} else {
			$("*").css("cursor", "default");
		}
	}
}

function process(url, callback) {
	try {
		$.ajaxSync({url: host + path + "/POST", type: "POST", data: { URL: url }, success: function(n3) {
			try {
				callback(n3);
			} catch (e) {
				alert("ERROR [ajax] " + e.message);
				showWait(false);
			}
		}});
	} catch (e) {
		alert("ERROR [process] " + e.message);
		showWait(false);
	}
}

function getList(n3) {
	var statements = [];
	
	var pattern = "\\d*\\|\\w*\\|\\w*\\|\\w*\\|\\s*";
	
	
	var regex = new RegExp(pattern, "g");
	statements = n3.match(regex);
	
	if (statements == null) {
		alert ("no list found");
		statements = [];
	}
	return statements;
}

function getResults()
{
   //transform query and get patient list coi database 
	try {
		showWait(true);
  		process(host + path + "/swoPatient?", function(n3) {
           //alert(n3);
          
           var patientlist = []; 
           //patientlist = getList(n3);
           patientlist = n3.split("|");
          
           var length = patientlist.length;
            alert (length);
           if (length > 0) {
           		var s = "";
           		for (var i = 7; i < length; i += 5) {
                    //alert (patientlist[i]);
           			 s += "<tr nowrap> \n";
           			for (var j = 0; j < 5; j++) {  
          				   s +="<td>" + patientlist[i+j] + "</td> \n";
          			}          
        			s += "</tr>\n";
        			i++;
        			
        			//alert (s);
           			
           		}
           		
           	$("#pListBody").append(s);
           	}
           	
           	//$("#PLIST").append(n3);
 			showWait(false);
 		});
 	} 
 	catch (e) {
 		alert("ERROR [suggest]:" + e.toString());
		showWait(false);
		throw e;
	}
}



/* document ready */
$(function() {
		getResults();
});
