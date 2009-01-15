function loadSPARQL(){
	var tbody = window.opener.document.getElementById("inListBody");
	var genderStr="";
	var ageStr="\t\t?patient sdtm:hasAge ?age .\n";
	var drugStr="";
	var flg=0;
	var maxAge=0;
	var minAge=0;
	$(tbody).find("tr").each(function(){
			var tr = $(this).get(0);
			var tdValue = tr.childNodes[0].childNodes[0].nodeValue;
			if(tdValue == "Male"){
				if(tr.childNodes[2].childNodes[0].nodeValue == "true"){
					genderStr = genderStr + "\t\t?patient sdtm:gender :Male .\n"
				}
			}
			else if(tdValue == "Female"){
				if(tr.childNodes[2].childNodes[0].nodeValue == "true"){
					genderStr = genderStr + "\t\t?patient sdtm:gender :Female .\n"
				}
			}
			else if(tdValue == "AgeMin"){
				flg++;
				minAge = tr.childNodes[2].childNodes[0].nodeValue;
			}
			else if(tdValue == "AgeMax"){
				flg++;
				maxAge = tr.childNodes[2].childNodes[0].nodeValue;
			}
			else{
				drugStr = drugStr + "\t\t?x1 rdf:type sdtm:"+ tdValue + "\n";
				var index = tr.id.indexOf("_");
				if(index != -1){
					drugId = tr.id.substring(index+1, tr.id.length);
					var durgInfo = window.opener.document.getElementById(drugId);
					$(durgInfo).find("li").each(function(){
						if($(this).get(0).childNodes[1] != undefined){
							var drugName = $(this).get(0).childNodes[1].nodeValue;
							drugStr = drugStr + "\t\t?x1 rdf:type sdtm:"+ drugName + "\n";
						}
					});
				}
			}
			
			$("#genderCond").get(0).innerHTML=genderStr;
			
		}
	);
	// add one conditon
	if(flg == 1){
		if(maxAge!=0){
			ageStr = ageStr + "\t\tFILTER ( ?age <= " + maxAge + " )\n";
		}
		else{
			ageStr = ageStr + "\t\tFILTER ( ?age >= " + minAge + " )\n";
		}
	}
	
	// add two condition
	if(flg == 2){
		ageStr = ageStr + "\t\tFILTER ( ?age >= " + minAge + " && ?age <= " + maxAge + " )\n";
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

$(function() {
	$(document).ready(
		function(){
			loadSPARQL();
		}
	);
		
});