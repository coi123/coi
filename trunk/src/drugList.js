function showDetailInfo(){
    var args=new Object();   
    var query=location.search.substring(1);
    var str = query.split("&");  
    var id=str[0].substring(str[0].indexOf('=')+1);
    var flg = str[1].substring(str[1].indexOf('=')+1);
    if(flg == 0){
    	$("#subTitle").get(0).innerHTML = " Clinical Observations Interoperability Demo : Drug Info";
    	$("#tdTag").get(0).innerHTML="Drug";
    }
    else{
    	$("#subTitle").get(0).innerHTML = " Clinical Observations Interoperability Demo : Sdtm Info";
    	$("#tdTag").get(0).innerHTML="Sdtm";
    }
	var targetElement = window.opener.document.getElementById(id);
	var liElements = $(targetElement).find("li");
	$(liElements).each(
		function(){
			var liElement = $(this).get(0);
			if(liElement.childNodes.length >1){
				var value = liElement.childNodes[1].nodeValue;
			}
			else{
				var value = liElement.childNodes[0].nodeValue;
			}
			$("#drugListId").append("<tr nowrap><td>" + value + "</td></tr>");
		}
	);
}