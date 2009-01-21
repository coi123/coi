function loadSPARQL(){
	var tbody = window.opener.document.getElementById("inListBody");
	var genderStr="";
	var ageStr="\t?patient sdtm:hasAge ?age .\n";
	var drugStr="";
	var flg=0;
	var maxAge=0;
	var minAge=0;
	$(tbody).find("tr").each(function(){
			var tr = $(this).get(0);
			var tdValue = tr.childNodes[1].childNodes[0].nodeValue;
			if(tdValue == "Male"){
				if(tr.childNodes[3].childNodes[0].nodeValue == "true"){
					genderStr = genderStr + "\t?patient sdtm:gender :Male .\n"
				}
			}
			else if(tdValue == "Female"){
				if(tr.childNodes[3].childNodes[0].nodeValue == "true"){
					genderStr = genderStr + "\t?patient sdtm:gender :Female .\n"
				}
			}
			else if(tdValue == "AgeMin"){
				flg++;
				minAge = tr.childNodes[3].childNodes[0].nodeValue;
			}
			else if(tdValue == "AgeMax"){
				flg++;
				maxAge = tr.childNodes[3].childNodes[0].nodeValue;
			}
			else{
				var index = tr.id.indexOf("_");
				var drugType = tr.childNodes[0].childNodes[0].nodeValue;
				var constraint = tr.childNodes[2].childNodes[0].value;
				drugStr = drugStr + "\t?x1 rdf:type " + drugType +  ":"+ tr.id.substring(index+1, tr.id.length-2)+ ";" + drugType + ":" + constraint + "\n";
				if(index != -1){
					drugId = tr.id.substring(index+1, tr.id.length);
					var durgInfo = window.opener.document.getElementById(drugId);
					$(durgInfo).find("li").each(function(){
						//if($(this).get(0).childNodes[1] != undefined){
						//	var drugName = $(this).get(0).childNodes[1].nodeValue;
						//	drugStr = drugStr + "\t\t?x1 rdf:type sdtm:"+ drugName + "\n";
						var childId = $(this).get(0).id.substring(0, $(this).get(0).id.length-2);
						drugStr = drugStr + "\t?x1 rdf:type " + drugType +  ":"+ childId + ";" + drugType + ":" + constraint + "\n";
						//}
					});
				}
			}
			
			$("#genderCond").get(0).innerHTML=genderStr;
			
		}
	);
	// add one conditon
	if(flg == 1){
		if(maxAge!=0){
			ageStr = ageStr + "\tFILTER ( ?age <= " + maxAge + " )\n";
		}
		else{
			ageStr = ageStr + "\tFILTER ( ?age >= " + minAge + " )\n";
		}
	}
	
	// add two condition
	if(flg == 2){
		ageStr = ageStr + "\tFILTER ( ?age >= " + minAge + " && ?age <= " + maxAge + " )\n";
	}
	
	if(flg != 0){
		$("#ageCond").get(0).innerHTML=ageStr;
	}
	else{
		$("#ageCond").hide();
	}
	if(drugStr == ""){
		$("#drugCond").hide();
	}
	if(genderStr == ""){
		$("#genderCond").hide();
	}
	$("#drugCond").get(0).innerHTML=drugStr;
}


function loadExtSPARQL(){
	var tbody = window.opener.document.getElementById("exListBody");
	var genderStr="";
	var ageStr="\t?patient sdtm:hasAge ?age .\n";
	var drugStr="";
	var flg=0;
	var maxAge=0;
	var minAge=0;
	$(tbody).find("tr").each(function(){
			var tr = $(this).get(0);
			var tdValue = tr.childNodes[1].childNodes[0].nodeValue;
			if(tdValue == "Male"){
				if(tr.childNodes[3].childNodes[0].nodeValue == "true"){
					genderStr = genderStr + "\t?patient sdtm:gender :Male .\n"
				}
			}
			else if(tdValue == "Female"){
				if(tr.childNodes[3].childNodes[0].nodeValue == "true"){
					genderStr = genderStr + "\t?patient sdtm:gender :Female .\n"
				}
			}
			else if(tdValue == "AgeMin"){
				flg++;
				minAge = tr.childNodes[3].childNodes[0].nodeValue;
			}
			else if(tdValue == "AgeMax"){
				flg++;
				maxAge = tr.childNodes[3].childNodes[0].nodeValue;
			}
			else{
				var index = tr.id.indexOf("_");
				var drugType = tr.childNodes[0].childNodes[0].nodeValue;
				var constraint = tr.childNodes[2].childNodes[0].value;
				drugStr = drugStr + "\t?x1 rdf:type " + drugType +  ":"+ tr.id.substring(index+1, tr.id.length-2)+ ";" + drugType + ":" + constraint + "\n";
				if(index != -1){
					drugId = tr.id.substring(index+1, tr.id.length);
					var durgInfo = window.opener.document.getElementById(drugId);
					$(durgInfo).find("li").each(function(){
						var childId = $(this).get(0).id.substring(0, $(this).get(0).id.length-2);
						drugStr = drugStr + "\t?x1 rdf:type " + drugType +  ":"+ childId + ";" + drugType + ":" + constraint + "\n";
						//}
					});
				}
			}
			
			$("#genderExtCond").get(0).innerHTML=genderStr;
			
		}
	);
	// add one conditon
	if(flg == 1){
		if(maxAge!=0){
			ageStr = ageStr + "\tFILTER ( ?age <= " + maxAge + " )\n";
		}
		else{
			ageStr = ageStr + "\tFILTER ( ?age >= " + minAge + " )\n";
		}
	}
	
	// add two condition
	if(flg == 2){
		ageStr = ageStr + "\tFILTER ( ?age >= " + minAge + " && ?age <= " + maxAge + " )\n";
	}
	
	if(flg != 0){
		$("#ageExtCond").get(0).innerHTML=ageStr;
	}
	else{
		$("#ageExtCond").hide();
	}
	if(drugStr == ""&&genderStr == ""&&flg==0){
		$("#exclution").hide();
	}
	if(drugStr == ""){
		$("#drugExtCond").hide();
	}
	if(genderStr == ""){
		$("#genderExtCond").hide();
	}
	$("#drugExtCond").get(0).innerHTML=drugStr;
}

$(function() {
	$(document).ready(
		function(){
			loadSPARQL();
			loadExtSPARQL();
		}
	);
		
});