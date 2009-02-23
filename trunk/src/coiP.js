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

function getSDTM()
{
	var s = "";

	s += "PREFIX sdtm: <http://www.sdtm.org/vocabulary#> \n"  +  
		 "PREFIX spl: <http://www.hl7.org/v3ballot/xml/infrastructure/vocabulary/vocabulary#> \n" +
		 "SELECT ?patient ?dob ?sex ?takes ?indicDate # ?indicEnd ?contra  \n" + 
 		 "WHERE { \n" +
  		 "?patient a sdtm:Patient ; \n" +
         "sdtm:middleName ?middleName ; \n" +
         "sdtm:dateTimeOfBirth ?dob ; \n" +
         "sdtm:sex ?sex . \n" +         
  		 "[	  sdtm:subject ?patient ; \n" +
	     "sdtm:standardizedMedicationName ?takes ; \n" +
	     "spl:activeIngredient [ spl:classCode 6809 ] ;\n" +
         "sdtm:startDateTimeOfMedication ?indicDate\n" +
         "].\n" +
/**         
         
         "  OPTIONAL { \n" +
" [	  sdtm:subject ?patient ; \n" +
"	  sdtm:standardizedMedicationName ?contra ; \n" +
"	  spl:activeIngredient [ spl:classCode 11289 ] \n" +
"         sdtm:effectiveTime [ \n" +
"         sdtm:startDateTimeOfMedication ?contraDate \n" +
"  ] . \n" + 
"  } \n" + */
         " } LIMIT 30 \n" ;
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

function getResults()
{
   //transform query and get patient list coi database 
	try {
		
		
		showWait(true);
  		
  		/**  calling swo.bat to generate all 3 temp files
  		     works fine on wopeg but encouter problems "url too large" when using proxy forwarding on DERI
  		*/     
  		var query = host + path + "/swoPatient?";
  			query += "sdtm=" + encodeURIComponent(host + path + "/.context" + encodeURIComponent(" "+getSDTM()));
 		    query += "&&hl7_sdtm=" + encodeURIComponent(host + path + "/.context" + encodeURIComponent(" " + getHL7_SDTM()));
  		    query += "&&db_hl7=" + encodeURIComponent(host + path + "/.context"+  encodeURIComponent(" " + getDB_HL7()));
  		    query += "&&db_link=" + getDBLink();
  		    
  		    //alert(query);
  		    
  		process(query, function(n3) {
        
        
        
       /**
        var query = host + path + "/tempfile?";
        //query += "sdtm=" + encodeURIComponent(host + path + "/.context+" + encodeURIComponent(" "+getSDTM()));
        query += "sdtm=" + (encodeURIComponent(getSDTM()));
        
        process(query, function(n3) {
           //alert(n3);
        */  
           var patientlist = []; 
           //patientlist = getList(n3);
           patientlist = n3.split("|");
          
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



/* document ready */
$(function() {
		getResults();
});
