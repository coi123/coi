function searchDrugList(container, nodeValue){
    
    if (nodeValue == "") {
    	alert ("please entry the search keyword");
    	return false;
    }
	container.empty();
	try {	
  		//$("#BROSWER li")
  		var searchResult = new Array();
  		var divElement = window.opener.document.getElementById("BROSWER");
  		var liElement = $(divElement).find("li");
  		var i = 0;
  		$(liElement).each(
  			function(){
  				var element = $(this).get(0);
  				if(element != undefined){
	  				var drugId = element.id;
	  				var drugName= getDrugNameForSearch(element);
	  				if(drugName != undefined && drugName != ""){
	  					if(drugName.toLowerCase().indexOf(nodeValue.toLowerCase())!=-1){
	  						container.append("<option value='" + drugId + "'>" + drugName + "</option>");
	 						$("#drugSelectBox").get(0).childNodes[i].selected = false;
	 						i++;
	  					}
	  				}
	  			}
  			}
  		);
  	}
 	catch (e) {
 		alert("ERROR [suggest]:" + e.toString());
 		throw e;
	}
 	
}


function loadSelectElements(){
		var browser = window.opener.document.getElementById("BROSWER");
		$(browser).children("li").children("ul").children("li").each(function(){
				$("#firstSelect").append("<option value='" + $(this).get(0).id + "'>" +
								$(this).get(0).childNodes[1].nodeValue + "</option>");
		});
		$("#firstSelect").get(0).childNodes[0].selected = true;
}

/* Bootstrap */
$(function() {
	$("#drugListSearch").click(function(){
		//alert(window.opener.relationArr);
		//var browser = window.opener.document.getElementById("BROSWER");
		//$(browser).children("li").children("ul").children("li").each(function(){
		//		alert($(this).get(0).childNodes[1].nodeValue);
		//});
		searchDrugList($("#drugSelectBox"), $("#drugName").val());	
	});
	
	$("#conformSelectValue").click(function(){
		var selectBox = $("#drugSelectBox").get(0);
		if(selectBox.value == ""){
			alert("please select the item!");
		}
		else{
			var divElement = window.opener.document.getElementById("BROSWER");
  			var liElement = $(divElement).find("li");
			$(liElement).each(
	  			function(){
	  				$(this).removeClass("selectColor");
	  			}
	  		);
			var element = window.opener.document.getElementById(selectBox.value);
			$(element).each(
	  			function(){
	  				$(this).removeClass("unselectColor");
	  				$(this).addClass("selectColor");
	  				//while($(this).get(0).offsetTop > 200){
	  				//	divElement.doScroll();
	  				//}
	  				var parentUL = $(this).get(0).parentNode;
	  				var parentLi;
	  				//alert(parent);
	  				while((parentUL.tagName == "UL") && (parentUL.style.display="none")){
	  					parentUL.style.display="block";
	  					parentLi = parentUL.parentNode;
	  					if(parentLi.tagName == "LI"){
	  						$(parentLi).removeClass("expandable");
	  						$(parentLi).removeClass("lastExpandable");
	  						$(parentLi).addClass("collapsable");
	  					}
	  					parentUL = parentLi.parentNode;
	  				}
	  				$(parentLi).removeClass("expandable");
	  				$(parentLi).addClass("collapsable");
	  				var selectedId = window.opener.document.getElementById(selectBox.value);
	  				var selectedValue = $(selectedId).get(0).textContent;
	  				window.opener.document.selectDrugName=selectedValue;
	  				$(this).get(0).scrollIntoView(true);
	  			}
	  		);
			window.close();
		}
	});
	$(document).ready(
		function(){
			loadSelectElements();
		}
	);
		
});