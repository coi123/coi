// implement sequential service calls, thanks to Kristof's help

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


function processQueue(url, callback) {
	try {
		$.ajaxQueue({url: host + path + "/POST", type: "POST", data: { URL: url }, success: function(n3) {
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

//Kristof
function processWithResult(url, callback) {
	try {
		$.ajax({url: "/POST", type: "POST", data: { URL: url }, async: false, success: function(n3) {
			try {
				result = callback(n3);
			} catch (e) {
				alert("ERROR [ajax] " + e.message);
			}
		}});
	} catch (e) {
		alert("ERROR [process] " + e.message);
	}
	return result;
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

function getSDTM_static()
{
	var s = "";
    
	
	s += "PREFIX sdtm: <http://www.sdtm.org/vocabulary#> \n"  +  
		 "PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#> \n" +
		 "SELECT DISTINCT ?patient ?dob ?sex ?takes ?indicDate   \n" + 
 		 "WHERE { \n" +
  		 "?patient a sdtm:Patient ; \n" +
         "sdtm:middleName ?middleName ; \n" +
         "sdtm:dateTimeOfBirth ?dob ; \n" +
         "sdtm:sex ?sex . \n" +         
  		 "[	  sdtm:subject ?patient ; \n" +
	     "sdtm:standardizedMedicationName ?takes ; \n" +
	     "spl:activeIngredient [ spl:classCode ?code ] ;\n" +
         "sdtm:startDateTimeOfMedication ?indicDate\n" +
         "]. FILTER (?code = 6809 || ?code = 11289) "     
    s += " } LIMIT 30 \n" ;
         
    
    return s;
} 

function getHL7_SDTM()
{
	var s = "";
	s += "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n" + 
			 "PREFIX hl7: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#> \n" + 
			 "PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#> \n" + 
			 "PREFIX sdtm: <http://www.sdtm.org/vocabulary#> \n" + 
			 "PREFIX bridg: <> \n" + 
			 "PREFIX caBIG: <> \n" + 
			 "PREFIX CDASH: <> \n" + 
			 "PREFIX MHONG: <> \n" + 
			 "PREFIX dam: <> \n" + 
			 "CONSTRUCT { \n" + 
			 "?patient \n" + 
    			 "a					 		sdtm:Patient ; \n" + 
    			 "sdtm:middleName			?middleName ; \n" + 
    			 "sdtm:dateTimeOfBirth		?dob ; \n" + 
    			 "sdtm:sex 					?sex . \n" + 
			 "[		a	       sdtm:ConcomitantMedication ; \n" + 
				 "sdtm:subject   ?patient ; \n" + 
				 "sdtm:standardizedMedicationName	 ?takes ; \n" + 
				 "spl:activeIngredient [ spl:classCode ?ingred ] ; \n" + 
				 "sdtm:startDateTimeOfMedication ?start \n" + 
    		  "] . \n" + 
			 "} WHERE { \n" + 
			 "?patient \n" + 
    			 "a					  hl7:Person ; \n" + 
    			 "hl7:entityName			  ?middleName ; \n" + 
    			 "hl7:livingSubjectBirthTime		  ?dob ; \n" + 
    			 "hl7:administrativeGenderCodePrintName ?sex ; \n" + 
    			 "hl7:substanceAdministration		  [ \n" + 
				 "a	       hl7:SubstanceAdministration ; \n" + 
 				 "hl7:consumable [ \n" + 
	    			 "hl7:displayName	 ?takes ; \n" + 
	    			 "spl:activeIngredient [ \n" + 
					 "spl:classCode ?ingred \n" + 
	    			 "] \n" + 
				 "] ; \n" + 
				 "hl7:effectiveTime [ \n" + 
	    			 "hl7:start ?start \n" + 
				 "] \n" + 
    			 "] . \n" + 
			 "} \n" ; 
    return s;
}

function getDB_HL7()
{
	var s = "";
		s += "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n" +
			 "PREFIX Person: <http://hospital.example/DB/Person#> \n" +
			 "PREFIX Sex_DE: <http://hospital.example/DB/Sex_DE#>\n" +
			 "PREFIX Item_Medication: <http://hospital.example/DB/Item_Medication#> \n" +
			 "PREFIX Medication: <http://hospital.example/DB/Medication#> \n" +
			 "PREFIX Medication_DE: <http://hospital.example/DB/Medication_DE#> \n" +
			 "PREFIX NDCcodes: <http://hospital.example/DB/NDCcodes#> \n" +
			 "PREFIX hl7: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#> \n" +
			 "PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#> \n" +
			 "CONSTRUCT { \n" +
			 "\n" +
			 "?person \n" +
			 "    a					  hl7:Person ; \n" +
			 "    hl7:entityName			  ?middleName ; \n" +
			 "    hl7:livingSubjectBirthTime		  ?dob ; \n" +
			 "    hl7:administrativeGenderCodePrintName ?sex ; \n" +
			 "    hl7:substanceAdministration		  [ \n" +
			 "	a	       hl7:SubstanceAdministration ; \n" +
			 " 	hl7:consumable [ \n" +
			 "	    hl7:displayName	 ?takes ; \n" +
			 "	    spl:activeIngredient [ \n" +
			 "		spl:classCode ?ingred \n" +
			 "	    ] \n" +
			 "	] ; \n" +
			 "	hl7:effectiveTime [ \n" +
			 "	    hl7:start ?indicDate \n" +
			 "	    # hl7:end   (?indicDate + ?indicDuration) \n" +
			 "	] \n" +
			 "    ] . \n" +
			 "} WHERE { \n" +
			 "  ?person     Person:MiddleName		     ?middleName ; \n" +
			 "              Person:DateOfBirth	     ?dob ; \n" +
			 "              Person:SexDE		     ?sexEntry   . \n" +
			 " \n" +
			 "  OPTIONAL { \n" +
			 "              ?sexEntry   Sex_DE:EntryName   ?sex . \n" +
			 "  } \n" +
			 "  OPTIONAL { \n" +
			 "  ?indicItem  Item_Medication:PatientID	     ?person ; \n" +
			 "              Item_Medication:PerformedDTTM  ?indicDate ; \n" +
			 "              Item_Medication:EntryName	     ?takes . \n" +
			 "  ?indicMed   Medication:ItemID		     ?indicItem ; \n" +
			 "              Medication:DaysToTake	     ?indicDuration ; \n" +
			 "              Medication:MedDictDE	     ?indicDE . \n" +
			 "  ?indicDE    Medication_DE:NDC		     ?indicNDC . \n" +
			 "  } \n" +
			 " \n" +
			 "  OPTIONAL { \n" +
			 "  ?indicCode  NDCcodes:NDC         ?indicNDC ; \n" +
			 "              NDCcodes:ingredient  ?ingred . \n" +
			 "  } \n" +
			 "} LIMIT 30 \n" ;
			 
    
	return s;
	

}


function getDBLink()
{
  //decide which database to get patient information
  var s = "http://hospital.example/DB/";
  return s;
}

function getResults(sdtm)
{
   //transform query and get patient list coi database 
	try {
		
		
		showWait(true);

		
  		/**  calling swo.bat to generate all 3 temp files
  		     works fine on wopeg but encouter problems "url too large" when using proxy forwarding on DERI
  		*/     
  		var query = host + path + "/swoPatient?";
  			query += "sdtm=" + encodeURIComponent(host + path + "/.context" + encodeURIComponent(" "+ sdtm));
 		    query += "&&hl7_sdtm=" + encodeURIComponent(host + path + "/.context" + encodeURIComponent(" " + getHL7_SDTM()));
  		    query += "&&db_hl7=" + encodeURIComponent(host + path + "/.context"+  encodeURIComponent(" " + getDB_HL7()));
  		    query += "&&db_link=" + getDBLink();
  		    
  		    //alert(query);
  		    
  		processQueue(query, function(n3) {
        
        
        
    
           var patientlist = []; 
           //patientlist = getList(n3);
           patientlist = n3.replace(/00:00:00/gi, "").split("|");
          
           var length = patientlist.length;
           // alert (length);
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
           	} else {
           	alert("No eligible patient found");
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

function getDrugSelection(tbody) {

	// get drug ingredients listed in inclusion/exclusion list 
	var drugStr="";
    var drugList = new Array();
    var i = 0;
    
    
	$(tbody).find("tr").each(function(){
		var tr = $(this).get(0);
		var tdValue = tr.childNodes[0].childNodes[0].nodeValue;

		if(tdValue == "do"){
			var index = tr.id.indexOf("_");               
			drugList[i++] = tr.id.substring(index+1, tr.id.length-2);			
			}
	 });

    var listStr = "";
    var j = drugList.length;
    if (j > 0) {
    	listStr += "and+(id%3d'" + drugList[0] + "'+";
    	for (i=1; i < j; i++) {
    	    listStr += "or+id%3d'" + drugList[i] + "'+"; 
    	    }
    	listStr +=");";    
    	}
     return listStr;
}

function getGender(tbody) {
  
  // get gender selection for criteria
	var genderStr="";
   
    
	$(tbody).find("tr").each(function(){
		var tr = $(this).get(0);
		var tdValue = tr.childNodes[1].childNodes[0].nodeValue;
        var tdBoolean = tr.childNodes[3].childNodes[0].nodeValue
        
		if(tdValue == "Male" && tdBoolean == "true"){
			if (genderStr != "") 
				genderStr += " || "
			genderStr += "?sex = \'Male\' ";
		}

		if(tdValue == "Female" && tdBoolean == "true"){
			if (genderStr != "") 
				genderStr += " || "
			genderStr += "?sex = \'Female\' ";
		}
	});
	
	return 	genderStr;	
}  

function getAge(tbody) {
  
  // get age selection for criteria
	var ageStr="";
    var today = new Date();
    

    var thisYear = today.getFullYear(); 
    var thisMonth = today.getMonth();
    var thisDate = today.getDate(); 
    
    
    
    
	$(tbody).find("tr").each(function(){
		var tr = $(this).get(0);
		var tdValue = tr.childNodes[1].childNodes[0].nodeValue;
        var tYear = tr.childNodes[3].childNodes[0].nodeValue;
        
        var backYear = thisYear*1 - tYear*1; 
        
        
		if(tdValue == "AgeMin"){
			if(ageStr != "") ageStr += " && ";
			ageStr += "(?dob < " + " \'" + backYear + "-" + thisMonth + "-" + thisDate + "T00:00:00\'^^xsd:dateTime ) " ;
		}

		if(tdValue == "AgeMax"){
			if (ageStr != "") ageStr += " && ";
			ageStr += "(?dob > " + " \'" +backYear + "-" + thisMonth + "-" + thisDate + "T00:00:00\'^^xsd:dateTime ) " ;
		}
	});
	
	
	return 	ageStr;	
}  


/* document ready */

$(function() {
	
	var inbody = window.opener.document.getElementById("inListBody");
	
	var sdtmRQ = "PREFIX sdtm: <http://www.sdtm.org/vocabulary#> \n"  +  
		 "PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#> \n" +
		 "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \n" +
		 "SELECT DISTINCT ?patient ?dob ?sex ?takes ?indicDate  \n" + 
 		 "WHERE { \n" +
  		 "?patient a sdtm:Patient ; \n" +
         "sdtm:middleName ?middleName ; \n" +
         "sdtm:dateTimeOfBirth ?dob ; \n" +
         "sdtm:sex ?sex . \n" +         
  		 "[	  sdtm:subject ?patient ; \n" +
	     "sdtm:standardizedMedicationName ?takes ; \n" +
	     "spl:activeIngredient [ spl:classCode ?code ] ;\n" +
         "sdtm:startDateTimeOfMedication ?indicDate\n" +
         "]. ";

     //get demographic and medication criteria such as gender and age constraint
     var genderStr = getGender(inbody);     
     var ageStr = getAge(inbody);
     var drugStr = getDrugSelection(inbody);
     
     var conditionStr = "";
     
     if (genderStr != "" || drugStr != "" || ageStr != "" )
        {
        	sdtmRQ += " FILTER (" ;
        	
     		if (genderStr != "") {
        		if (conditionStr != "") conditionStr += " && ";	
      			conditionStr += "(" + genderStr + ") "; 
      		 }     
     		if (ageStr != "") {
        		if (conditionStr != "") conditionStr += " && ";   
        		conditionStr += "(" + ageStr + ") "; 
       		}     	 
	  		if (drugStr != "") {
				if (conditionStr != "") conditionStr += " && ";   
				//get RxNORM code for drug ingredients in drug ontology	
	
					var query = host + path + "/drugRxCode?";
  					query += "drugList=" + encodeURIComponent(drugStr);
  					//alert (query);		

					conditionStr += processWithResult(query, function(n3) {
        
        			var ingredientList = n3.trim().split("\n"); 
        			var sdtmStr = "";
        			if (ingredientList.length > 0) 
        				{
        				 	sdtmStr = " (?code = " + ingredientList[0];        
         					for (var i = 1; i < ingredientList.length; i++)
            					sdtmStr += " || ?code = " + ingredientList[i];
         					sdtmStr += ") "    
       					}
     				//alert(sdtmStr);
     				return sdtmStr;
     			   });

     		}
     		
     		if (conditionStr != "") sdtmRQ += conditionStr;
     		
     		sdtmRQ += " ) \n ";
     		         
     	}
    
    sdtmRQ += "} LIMIT 30";
     
    alert(sdtmRQ);
	
	getResults(sdtmRQ);
});


String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}


