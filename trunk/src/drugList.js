function showDetailInfo(){
    var args=new Object();   
    var query=location.search.substring(1);
    var pos=query.indexOf('=');    
    var id=query.substring(pos+1);  
	var targetElement = window.opener.document.getElementById(id);
	var liElements = $(targetElement).find("li");
	$(liElements).each(
		function(){
			var liElement = $(this).get(0);
			var value = liElement.childNodes[1].nodeValue;
			$("#drugListId").append("<tr nowrap><td>" + value + "</td></tr>");
		}
	);
}