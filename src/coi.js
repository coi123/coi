var server = location.protocol + "//" + location.hostname + ":" + location.port;

var blockUI = true;
var inclusionFlag = false;
var selectId="&nbsp;"
var selectProperty="&nbsp;";
var childSelectDrugName;
var drugParentStr;
var selectTimeForAcr="";

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


function rowHover(tableID) 
{
	var e = tableID + " tr";
	var trs = $(e);
	for(var j=1, len=trs.length; j<len; j++) 
	{
		
		trs[j].onclick =  doSelect;
		trs[j].onmouseover=function() { this.className='hovered'; }
		trs[j].onmouseout=function() { this.className='list'; }
	}  
}
 
function rowHoverForCodeList(tbodyID) 
{
	var e = tbodyID + " tr";
	var trs =$(e); 
	for(var j=0, len=trs.length; j<len; j++) 
	{
		trs[j].onmouseover=function() { this.className='codehovered'; }
		trs[j].onmouseout=function() { this.className='codelist'; }
	}  
}

function doSelect(e)
{
	var el = (e&&e.target) || (event&&event.srcElement);
	
	var trElem = el.parentNode;
	var nodecount = trElem.childNodes.length;
	
	var pname = trElem.childNodes[0].innerHTML + "," + trElem.childNodes[1].innerHTML + "," + trElem.childNodes[2].innerHTML + ","+ trElem.childNodes[4].innerHTML + ","+ trElem.childNodes[3].innerHTML;

	
	//assign the details of the selected patient to "patient field"
    
	$("#SELECTEDP").attr({ value: pname});
	//getDetailInfo(trElem);
}

/* Extract the fragment id from the given URI */
function extractFragmentId(uri) {
	var i = uri.indexOf(":")
    if (i <0) {
    	return ""
    }
    return uri.slice(i+1,uri.length)
}

/* Extract the id from prefix-ed name, for example, given D:C12345, return C12345 */
function filterPrefix(pname) {
	var i = pname.indexOf(":")
    return pname.slice(i+1,pname.length)
}

/* Transform the N3 retrieved from the URL to RDF/XML and process it in the callback function. */
function processRDF(url, callback) {
	try {
		$.post(server + "/JENA2", { URL: url, CONVERSION: "N3 RDF/XML" }, function(rdfXml) {
			callback(rdfXml);
		});
	} catch (e) {
		alert("ERROR [processRDF] " + e);
	}
}

// direct processing the N3 string using pattern matching
function process(url, callback) {
	try {
		$.ajaxSync({url: server + "/POST", type: "POST", data: { URL: url }, success: function(n3) {
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


/* Returns the subject of the N3 triple statement */
function getSubject(statement) {
	var subject = statement.split(" ");	
	return subject[0];
}

/* Returns the object of the N3 triple statement */
function getObject(statement) {
	var objects = statement.split(" ");
	var obj = "";
	var p = "\\w*[^\"\.]";
	var regex = new RegExp(p, "g");
	
	for (var i = 2; i <= objects.length-1; i++)  {
	    obj +=  objects[i].match(regex) + " ";
	}
	return obj;
}

/* Returns an array with the statements having the 'property' predicate. */
function getStatements(n3, property) {
	var statements = [];
	
	//replace : with \\: for matching expression
	var p = property.replace(/:/,"\\\:");
	var pattern = "\\w*\\:\\w*\\s+" + p + "+\\s.*";
	
	
	var regex = new RegExp(pattern, "g");
	statements = n3.match(regex);
	
	if (statements == null) {
		alert ("no statement found");
		statements = [];
	}
	return statements;
}

function getStatementsForLoadAllTree(n3, property) {
	var statements = [];
	//replace : with \\: for matching expression
	var p = property.replace(/:/,"\\\:");
	var pattern = "\\w*\\:\\w*\\s+" + p + "+\\s.*";
	
	
	var regex = new RegExp(pattern, "g");
	statements = n3.match(regex);
	
	if (statements == null) {
		alert ("no statement found");
		statements = [];
	}
	return statements;
}


function loadPropertyTree(container, value, id) {
	var nodeValue ="";
	alert ("loading property tree: id = " +  id + ", value = " + value);
	if($(container).get(0).childNodes.length > 0){
		nodeValue = $(container).get(0).firstChild.childNodes[1].nodeValue;
	}
	if("Property of "+value != nodeValue){
		$(container).empty();
		
		//get indications that have bodyLocation as their "hasLocativeAttribute"
		$(container).append(getRootNode("Property for "+value, "Property"));
		
		
		$(container).Treeview({speed: "fast",
				toggle: function() {
			}
			});
		//load indicaiton list (from ACR and UMMS reason for study list)
		loadIndicationSubTree("#Indication", bodyID);
		

	}
}






//get tree sub-nodes 
function getTreeData(node, value, type){
   
   	alert ("get sub tree data: node" + node +", value ="+value + "type = " + type );
    showWait(true);
    
    var querystr = "";
    switch (type) 
    {
     	case "subPropertyOf": 
     		querystr += server + "/doSubProperty?propertyName=D:"+encodeURIComponent(value);
     		break;
    	case "subClassOf": 
    		querystr += server + "/doSubName?drugClass="+encodeURIComponent(value);
    		break;
    	default:
    		alert ("not a valid data type for view view");
    		return false;	
    }
    
    
  	process(querystr, function(n3) {
 		try{			
			var triples = getStatements(n3, "rdfs:label");
			//alert ("subitems no "+subItemsName.length)
			
			if (triples.length > 0) { 
				var drugList = new Array();
				for (var i = 0; i < triples.length; i++)
					{
						var nodeID = extractFragmentId(getSubject(triples[i]));
						var nodeValue = getObject(triples[i]);                
						node.append("<li id='" + nodeID + "li' class='closed unselectColor'>" + nodeValue + getTempNode(nodeID) + "</li>");
					}
			}
			else { 
				alert ("There is no sub-items for this node")
			}	
			
			getTreeView(node);
			showWait(false);
			
			var ulId = node.get(0).id;
			$("#" + ulId + " li").click(function(){
					var children = $(this).find(".selectColor");
					if(children.length == 0){
						$("#BROSWER .selectColor").each(function(){
							$(this).removeClass("selectColor");
						});
						
						// aviod the children select start
						$(this).removeClass("unselectColor");
						var ulChildren = $(this).children("ul");
						if(ulChildren.length != 0){
							liChildren = $(ulChildren).children("li");
							if(liChildren.length != 0){
								for(var i = 0 ; i < liChildren.length;i++){
									$(liChildren).addClass("unselectColor");
								}
							}
						}
						var bodyId = this.id.substring(0, this.id.length-2);
						// aviod the children select end
						$(this).addClass("selectColor");
						selectTimeForAcr = new Date().getTime();
						if(this.lastChild.id != undefined){
							selectId = this.lastChild.id;
						}
						else{
							selectId = this.id;
						}
						
					}
					else{
						var flg = 0;
						$("BROSWER .selectColor").each(function(){
							var time = new Date().getTime();
							if(time-selectTimeForAcr >= 1000){
								flg = 1;
								$(this).removeClass("selectColor");
							}
						});
						if(flg == 1){
							// aviod the children select start
							$(this).removeClass("unselectColor");
							var ulChildren = $(this).children("ul");
							if(ulChildren.length != 0){
								liChildren = $(ulChildren).children("li");
								if(liChildren.length != 0){
									for(var i = 0 ; i < liChildren.length;i++){
										$(liChildren).addClass("unselectColor");
									}
								}
							}
							var bodyId = this.id.substring(0, this.id.length-2);
							// aviod the children select end
							$(this).addClass("selectColor");
							selectTimeForAcr = new Date().getTime();
							if(this.lastChild.id != undefined){
								selectId = this.lastChild.id;
							}
							else{
								selectId = this.id;
							}
							flg = 0;
						}
					}
			});
			//mouserOverColor(node);
			//$("#" + ulId + " li").mouseover(function(){$(this).addClass("mouserOverColor").removeClass("mouserOutColor")}).mouseout()(function(){$(this).addClass("mouserOutColor").removeClass("mouserOverColor")});
		} catch (e) {
			alert("loadSubItem error:" + e);
			showWait(false);
		}
	});
		
}


function mouserOverColor(node) 
{
	var nodeElement = node[0];
	for(var j=0, len=nodeElement.childNodes.length; j<len; j++) 
	{
		var liElement = nodeElement.childNodes[j];
		liElement.onmouseover=function() {
			//if(liElement.className.indexOf("final") != -1){
				dealTreeColor(0, this, "mouserOverColor");
				dealTreeColor(1, this, "mouserOutColor");
			//}
		}
		liElement.onmouseout=function() {
			//if(liElement.className.indexOf("final") != -1){
				 dealTreeColor(1, this, "mouserOverColor");
				 dealTreeColor(0, this, "mouserOutColor"); 
			//}
		}
	} 
}

function mouserOverColorForPathology(node) 
{
	var nodeElement = node[0];
	for(var j=0, len=nodeElement.childNodes.length; j<len; j++) 
	{
		var liElement = nodeElement.childNodes[j];
		liElement.onmouseover=function() {
			if(liElement.className.indexOf("final1") != -1){
				dealTreeColor(0, this, "mouserOverColor");
				dealTreeColor(1, this, "mouserOutColor");
			}
		}
		liElement.onmouseout=function() {
			if(liElement.className.indexOf("final1") != -1){
				dealTreeColor(1, this, "mouserOverColor");
				dealTreeColor(0, this, "mouserOutColor");
			}
		}
	}  
}
// deal the tree style
function dealTreeColor(flg, obj, className){
	
	// delete the tree color
	if(flg == 0){
		obj.className=obj.className + " " + className;
	}
	else{
		var styleClass = obj.className;
		var index = styleClass.indexOf(className);
		var resultClass="";
		if(index != -1){
			if(index != 0){
				resultClass = styleClass.substring(0, index);
			}
			resultClass = resultClass + styleClass.substr(index+className.length+1, styleClass.length);
			obj.className=resultClass;
		}
	}
}




// get temp node string
function getTempNode(item){
	return "<ul id=" + item + "></ul>"
}

function toggleDetailContainer(name){    
	$(".showDetails").hide();
	$(name).show();
}
function toggleSectionContainer(name) {
	$(".selected").attr("class","unselected");
	$(name).attr("class","selected");
}


function selectById(id){
	toggleDetailContainer("#INDICATION");
	toggleSectionContainer("#INDICATIONCONTAINER");
		
	ontologyTreeView("#BROSWER");
	$("#pathology").empty();
	var trElement = $("#" + id).get(0);
	$(".codehovered").each(function(){
			this.className = "codelist";
		}
	);
	trElement.className='codehovered';
}

function deleteById(id){
	$("#"+id).remove();
}
function searchAllDrugTree(container, nodeValue){
    $("#searchValue").text("");
    if (nodeValue == "") {
    	alert ("please entry the search keyword");
    	return false;
    }
	//showWait(true);
	
	try {
  		//process(server + "/doSubAll?a=1", function(n3) {
  			//now you get all sub tree data
  			var n3="";
			var drugInfoArray = getAllTreeInfo(n3);
			displayAllTree("#BROSWER", drugInfoArray);
			//var foundTerms = processTerms(n3);
 			//if (foundTerms.length > 0)
			//{
 			//	displayTree(container, foundTerms, "subClassOf");
 			//} else  {
 			//	alert ("no terms found");
 			//}
 			//showWait(false);
 		//});
 	} 
 	catch (e) {
 		alert("ERROR [suggest]:" + e.toString());
		//showWait(false);
		throw e;
	}
	
}

function displayAllTree(container, drugInfoArray){
	// append firstLevel node
	var rootNodeId = "C1690586";
	var rootNodeValue = "General drug type";
	
	$(container).append("<li id='" + rootNodeId + "li' class='closed unselectColor'>" + rootNodeValue + getTempNode(rootNodeId) + "</li>");
	
	// apend second level node
	var firstLevelDrug = getFirstLevelDrug(drugInfoArray);
	//for(var i=0;i<firstLevelDrug.length;i++){
	//	$("#"+rootNodeId).append("<li id='" + drugInfoArray[i][0] + "li' class='closed unselectColor'>" + drugInfoArray[i][1] + getTempNode(drugInfoArray[i][0]) + "</li>");
	//	appendAllChild(new Array(drugInfoArray[i][0]), drugInfoArray);
	//}
	appendAllChild(rootNodeId, firstLevelDrug, drugInfoArray);
	//var a = $("#" + rootNodeId+"li");
	//alert(a);
	$(container).Treeview({
			speed: "fast",
          	toggle: function() {}
    });
	$(container + " li").click(function(){
			var children = $(this).find(".selectColor");
			if(children.length == 0){
				$("#BROSWER .selectColor").each(function(){
					$(this).removeClass("selectColor");
				});
				
				// aviod the children select start
				$(this).removeClass("unselectColor");
				var ulChildren = $(this).children("ul");
				if(ulChildren.length != 0){
					liChildren = $(ulChildren).children("li");
					if(liChildren.length != 0){
						for(var i = 0 ; i < liChildren.length;i++){
							$(liChildren).addClass("unselectColor");
						}
					}
				}
				var bodyId = this.id.substring(0, this.id.length-2);
				// aviod the children select end
				$(this).addClass("selectColor");
				selectTimeForAcr = new Date().getTime();
				if(this.lastChild.id != undefined){
					selectId = this.lastChild.id;
				}
				else{
					selectId = this.id;
				}
				
			}
			else{
				var flg = 0;
				$("#BROSWER .selectColor").each(function(){
					var time = new Date().getTime();
					if(time-selectTimeForAcr >= 1000){
						flg = 1;
						$(this).removeClass("selectColor");
					}
				});
				if(flg == 1){
					// aviod the children select start
					$(this).removeClass("unselectColor");
					var ulChildren = $(this).children("ul");
					if(ulChildren.length != 0){
						liChildren = $(ulChildren).children("li");
						if(liChildren.length != 0){
							for(var i = 0 ; i < liChildren.length;i++){
								$(liChildren).addClass("unselectColor");
							}
						}
					}
					var bodyId = this.id.substring(0, this.id.length-2);
					// aviod the children select end
					$(this).addClass("selectColor");
					selectTimeForAcr = new Date().getTime();
					if(this.lastChild.id != undefined){
						selectId = this.lastChild.id;
					}
					else{
						selectId = this.id;
					}
					flg = 0;
				}
			}
	});
}

function appendAllChild(parentNodeId, childIds, drugInfoArray){
	if(childIds != undefined){
		for(var childIndex = 0 ; childIndex < childIds.length;childIndex++){
			var drugId = drugInfoArray[childIds[childIndex]][0];
			var drugIndex = getDrugIndexById(drugInfoArray, drugId);
			if(hasChild(drugId)){
				$("#"+parentNodeId).append("<li id='" + drugId + "li' class='closed unselectColor'>" + drugInfoArray[drugIndex][1] + getTempNode(drugId) + "</li>");
				var ids = getAllChildIds(drugId, drugInfoArray);
				appendAllChild(drugId, ids, drugInfoArray);
			}
			else{
				$("#"+parentNodeId).append("<li id='" + drugId + "li' class='closed unselectColor'>" + drugInfoArray[drugIndex][1] + "</li>");
				//return;
			}
		}
	}
}

function getAllChildIds(drugId, drugInfoArray){
	var drugChildIds = new Array();
	var j = 0;
	for(var i =0;i < drugInfoArray.length;i++){
		if(drugInfoArray[i][2] == drugId){
			drugChildIds[j++]=i;
		}
	}
	return drugChildIds;
}

function hasChild(drugId){
	if(drugParentStr.indexOf(drugId)==-1){
		return false;
	}
	else{
		return true;
	}
}

function getFirstLevelDrug(drugInfoArray){
	// default startLevel
	var firstLevel = 1;
	var drugArr = new Array();
	var j = 0;
	for(var i = 0; i < drugInfoArray.length;i++){
		if(drugInfoArray[i][3] == firstLevel){
			drugArr[j++] = i;
		}
	}
	return drugArr;
}
function getAllTreeInfo(n3){
	n3="@prefix str: <http://www.w3.org/2000/10/swap/string#>.\n"+
				"@prefix var: <http://localhost/var#>.\n"+
				"@prefix q: <http://www.w3.org/2004/ql#>.\n"+
				"@prefix list: <http://www.w3.org/2000/10/swap/list#>.\n"+
				"@prefix e: <http://eulersharp.sourceforge.net/2003/03swap/log-rules#>.\n"+
				"@prefix fn: <http://www.w3.org/2006/xpath-functions#>.\n"+
				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.\n"+
				"@prefix : <http://www.owl-ontologies.com/DrugOntology.owl#>.\n"+
				"@prefix nsp0: <http://www.owl-ontologies.com/>.\n"+
				"@prefix time: <http://www.w3.org/2000/10/swap/time#>.\n"+
				"@prefix log: <http://www.w3.org/2000/10/swap/log#>.\n"+
				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.\n"+
				"@prefix n3: <http://www.w3.org/2004/06/rei#>.\n"+
				"@prefix math: <http://www.w3.org/2000/10/swap/math#>.\n"+
				"@prefix owl: <http://www.w3.org/2002/07/owl#>.\n"+
				"@prefix r: <http://www.w3.org/2000/10/swap/reason#>.\n"+
				"@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n"+
				"D:C0001962 rdfs:subClassOf D:C1690586.\n"+
				"D:C0017951 rdfs:subClassOf D:C1690586.\n"+
				"D:C0037556 rdfs:subClassOf D:C1690586.\n"+
				"D:C1563032 rdfs:subClassOf D:C1690586.\n"+
				"D:C1623735 rdfs:subClassOf D:C1690586.\n"+
				"D:C0719741 rdfs:subClassOf D:C0001962.\n"+
				"D:C0032483 rdfs:subClassOf D:C0017951.\n"+
				"D:C0072225 rdfs:subClassOf D:C0017951.\n"+
				"D:C0017861 rdfs:subClassOf D:C1563032.\n"+
				"D:C0028053 rdfs:subClassOf D:C1563032.\n"+
				"D:C1562418 rdfs:subClassOf D:C1563032.\n"+
				"D:C0022237 rdfs:subClassOf D:C1623735.\n"+
				"D:C0001962 D:level 1.\n"+
				"D:C0017951 D:level 1.\n"+
				"D:C0037556 D:level 1.\n"+
				"D:C1563032 D:level 1.\n"+
				"D:C1623735 D:level 1.\n"+
				"D:C0719741 D:level 2.\n"+
				"D:C0032483 D:level 2.\n"+
				"D:C0072225 D:level 2.\n"+
				"D:C0017861 D:level 2.\n"+
				"D:C0028053 D:level 2.\n"+
				"D:C1562418 D:level 2.\n"+
				"D:C0022237 D:level 2.\n"+
				"D:C0001962 rdfs:label \"Ethanol\".\n"+  
				"D:C0017951 rdfs:label \"Glycol\".\n"+
				"D:C0037556 rdfs:label \"Sodium Tetradecyl Sulfate\".\n"+
				"D:C1563032 rdfs:label \"Alcohol derivative\".\n"+
				"D:C1623735 rdfs:label \"Alcohol disinfectant\".\n"+
				"D:C0719741 rdfs:label \"denatured ethanol\".\n"+
				"D:C0032483 rdfs:label \"Polyethylene Glycols\".\n"+
				"D:C0072225 rdfs:label \"Propylene glycol\".\n"+
				"D:C0017861 rdfs:label \"Glycerol\".\n"+
				"D:C0028053 rdfs:label \"Nicotinyl Alcohol\".\n"+
				"D:C1562418 rdfs:label \"Alkanol\".\n"+
				"D:C0022237 rdfs:label \"Isopropanol\".\n"+
				"D:C0991869 rdfs:subClassOf :C0072225.\n"+
				"D:C0215278 rdfs:subClassOf :C1562418.\n"+
				"D:C0991869 :level 3.\n"+
				"D:C0215278 :level 3.\n"+
				"D:C0991869 rdfs:label \"PROPYLENE GLYCOL DIACETATE\".\n"+
				"D:C0215278 rdfs:label \"policosanol\".\n";
	//var time1 = new Date().getTime();
	var statements = n3.split("\n");
	alert(statements.length);
	var levelpattern = "D{1}\\:\\w+\\s+\\D{1}:level.*";
	var labelpattern = "D{1}\\:\\w+\\s+rdfs\\:label\\s+.*";
	var subclasspattern = "D{1}\\:\\w+\\s+rdfs\\:subClassOf\\s+.*";
	var levelRegex = new RegExp(levelpattern, "g");
	var labelRegex = new RegExp(labelpattern, "g");
	var subclassRegex = new RegExp(subclasspattern, "g");
	var drugArr = new Array();
	var j = 0;
	var drugParentIndex=0;
	var drugParentIdArr=new Array();
	for(var i = 0;i < statements.length;i++){
		var drugId = getDrugId(statements[i]);
		var drugIndex = getDrugIndexById(drugArr, drugId);
		if(statements[i].match(levelRegex)!=null){
			var drugLevel = getDrugLevel(statements[i]);
			if(drugIndex != -1){
				drugArr[drugIndex][3] = drugLevel;
			}
			else{
				if(drugArr[j] == undefined){
					drugArr[j] = new Array();
				}
				drugArr[j][0] = drugId;
				drugArr[j][3] = drugLevel;
				j++;
			}
		}		
		else if(statements[i].match(labelRegex)!=null){
			var drugName = getDrugName(statements[i]);
			if(drugIndex != -1){
				drugArr[drugIndex][1] = drugName;
			}
			else{
				if(drugArr[j] == undefined){
					drugArr[j] = new Array();
				}
				drugArr[j][0] = drugId;
				drugArr[j][1] = drugName;
				j++;
			}
		}
		else if(statements[i].match(subclassRegex)!=null){
			var drugParentId = getDrugParentId(statements[i]);
			if(drugIndex != -1){
				drugArr[drugIndex][2] = drugParentId;
				drugParentIdArr[drugParentIndex] = drugParentId;
				drugParentIndex++;
			}
			else{
				if(drugArr[j] == undefined){
					drugArr[j] = new Array();
				}
				drugArr[j][0] = drugId;
				drugArr[j][2] = drugParentId;
				drugParentIdArr[drugParentIndex] = drugParentId;
				drugParentIndex++;
				j++;
			}
		}
		else{
			continue;
		}
	}
	drugParentStr = drugParentIdArr.join(",");
	return drugArr;
}

function getDrugId(str){
	return str.substring(2, str.indexOf(" "));
}

function getDrugLevel(str){
	return str.substring(str.lastIndexOf(" ")+1, str.length-1);
}

function getDrugName(str){
	return str.substring(str.indexOf("\"")+1, str.lastIndexOf("\""));
}

function getDrugParentId(str){
	return str.substring(str.lastIndexOf(":")+1, str.length-1);
}

function getDrugIndexById(drugArr, drugId){
	var result = -1;
	var length = drugArr.length;
	var array = new Array();
	for(var i = 0;i < length;i++){
		if(drugArr[i][0] == drugId){
			result = i;
			break;
		}
	}
	return result;
}
function searchDrugTree(container, nodeValue){
    $("#searchValue").text("");
    $("#BROSWER").empty();
    $("#PROPERTY").empty();
    if (nodeValue == "") {
    	alert ("please entry the search keyword");
    	return false;
    }
	showWait(true);
	
	try {	
  		process(server + "/doNames?drugName="+encodeURIComponent(nodeValue), function(n3) {  		

			var foundTerms = processTerms(n3);
 			if (foundTerms.length > 0)
			{
 				displayTree(container, foundTerms, "subClassOf");
 			} else  {
 				alert ("no terms found");
 			}
 		});
 	} 
 	catch (e) {
 		alert("ERROR [suggest]:" + e.toString());
		showWait(false);
	}
 	
}

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

function getDrugNameForSearch(element){
 	var drugName;
	if(element.childNodes.length >1){
		drugName = element.childNodes[1].nodeValue;
	}
	else if(element.childNodes.length ==1){
		drugName = element.childNodes[0].nodeValue;
	}
	else{
		drugName = element.textContent;
	}
	return drugName;
}

function processTerms(n3)
{
	var foundTerms = getStatements(n3,"rdfs:label");		
	alert ("found Terms: "+foundTerms.length);
	
	var foundTermsList = new Array();	
	if (foundTerms.length > 0)
	{
		for (var index = 0; index < foundTerms.length; index++) {		
			var nodeName = getObject(foundTerms[index]);
			var nodeID = getSubject(foundTerms[index]);			
			foundTermsList.push([filterPrefix(nodeID), nodeName]);
		} 
	}
	else {
		alert ("no terms found");
	}
		
	showWait(false); 
	return foundTermsList;
}

function displayTree(container,nodeValue, type)
{
	$(container).empty();	
	
	for(var i = 0;i < nodeValue.length; i++){		
		$(container).append(getRootNode(nodeValue[i][1], nodeValue[i][0]));
	}
	
	$("li", container).click(function(){
		selectTreeItem(container, type);
	});
	
	getTreeView(container);	
}

// get Tree view
function getTreeView(container){
	$(container).Treeview({speed: "fast",
		toggle: function() {
			if(this.style.display=="block"){
				appendTree($("#"+this.id));
			}
		}
	});
	
}

// get Tree root node for ontology tree
function getRootNode(rootNodeName, rootNodeID){
	var stree = "<li id='" + rootNodeID + "li' class='closed'>"+rootNodeName;
    stree=stree+"<ul id='" + rootNodeID + "'>";
    stree=stree+"</ul>";
    stree=stree+"</li>";
    return stree;
}


// append tree method
function appendTree(node){

	var nodeElement = node.get(0);
	alert ("inside appendTree: " +nodeElement.id);
	
	if(!nodeElement.hasChildNodes()){
		getTreeData(node, nodeElement.id, "subClassOf");
	}
}



function searchIndicationTree(container, nodeValue){
	$(container).empty();
	alert ("searching indication: "+nodeValue);
	$.blockUI("<p><img src='images/busy.gif' /> <strong>Please wait...</strong></p> ");
	var pquery = 	"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix : <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +    				
    				"{?A 	:Preferred_Name "+ nodeValue + ".}\n" +
 					"  => \n" +
 			       	"{?A 	:Preferred_Name "+ nodeValue + ".}\n";
    //alert (pquery);
    
    pquery = server + "/.context" + encodeURIComponent(" " + pquery);				
  	processRDF(server + "/radlexBodyParts?query="+encodeURIComponent(pquery), function(rdfXml) {
  		var parser = getRDFParser(rdfXml);
  		var foundTerms = getSubjectObjects(parser,"http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#Preferred_Name");
		
		foundTerms = [["Indication", "Indication"]];
		alert ("foundTerms: "+foundTerms.length);
		if (foundTerms.length > 0)
		{
			for(var i = 0;i < foundTerms.length; i++){
				var foundID = foundTerms[i][0];
				var foundName = foundTerms[i][1];
				$(container).append(getRootNode(foundName, foundID));
			}
            $(container).Treeview({speed: "fast",
	            toggle: function() {
		        if(this.style.display=="block"){
			           loadIndicationTree($("#"+this.id));
		        	}
				}
            });
            for(var i = 0;i < foundTerms.length; i++){
				var foundID = foundTerms[i][0];
				 loadIndicationTree($("#"+foundID));
			}
           
		}
		else{
			$(container).append("no indication found");
		}
		$.unblockUI();
		
	});
			
	//searchAnatomy = nodeValue;
	
	//ontologyTreeView("#BROSWER");
}
// get indication subtree
function loadIndicationTree(node){
	var nodeElement = node.get(0);
	if(!nodeElement.hasChildNodes()){
		var ulId = nodeElement.parentNode.childNodes[1].nodeValue;
		getTreeDataForIncation(node, ulId);
	}
}


function procedureTreeView() {

  var ptype, ptypeName, procInstances, cptCode, radCode, bodyPart, pname;
  if(procedureTreeViewLoadFlag == 1){
  	return;
  }
  procedureTreeViewLoadFlag = 1;
  procType = tempProcTypesForTreeView.uniqStr();
  for (var j = 0; j < procType.length; j++)
  {
	 ptype = procType[j];
	 //ptypeName = extractFragmentId(ptype);
	// root node array
	//if(j == procType.length -1){
	//	unBlockUIFlg = "1";
	//}
	var treeStr = getRootNode(ptype, ptype);
	$("#procedureTreeView").append(treeStr);
	appendTreeForProcedure($("#"+ptype));
  }
  
  $("#procedureTreeView").Treeview({
		speed: "fast"
		//,
		//toggle: function() {
		//	if(this.style.display=="block"){
		//		appendTreeForProcedure($("#"+this.id));
		//	}
		//}
	});
	/*
	$("#procedureTreeView li").click(function(){
		var children = $(this).find(".selectColor");
		if(children.length == 0){
			$("#procedureTreeView .selectColor").each(function(){
				$(this).removeClass("selectColor");
			});
			$(this).addClass("selectColor");
			procedureCode = this.lastChild.id;
			procedureDesp = this.childNodes[1].nodeValue;
		}
	});*/
}

function getProcIndexByProcType(ptype) {
	var procIndex = [];
	var index = 0;
	var k = globalProcID.length;
	
	for (var i = 0; i < k; i++ ) {
		if (globalProcTypes[i] == ptype) procIndex[index++] = i;
	}
	return  procIndex;
}

function getTempNodeForProcedure(item, ptype){
	return "<ul id='" + item  + ptype + "Procedure'></ul>"
}



function getIndexedResults(index, range)
{
	var indexedRange = new Array(10);
	for (var i = 0; i < index.length; i++ )
	{
	  var m = Number(index[i][1]);
	  var s = index[i][0];
	  for (var j = 0; j < index.length; j++)
	    {
	    	if (range[j][0] == s) 
	    	{
	    		indexedRange[m] = range[j][1];
	    		break;
	    	}
	    	
	    }	
	}
	return indexedRange;
}


function initDetailList(){
	$("#ACRINFORMATIONSOURCES tbody").empty();
	var trElements = $("#TPOLICY").children().children();
//	var infolink = ["http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007.owl", "http://umms.his.policy.net/CTContraindication/CTContraIndication.html", "http://blue.insurance.org/CTPolicy.html"]
	for(var i = 0; i < trElements.length;i++){
		var checkBoxElement = $(trElements[i]).children().children();
		if(checkBoxElement.get(0).checked==true){
			var checkBoxShow = checkBoxElement.get(0).nextSibling.nodeValue;
			var content = "";
			if(infolink[i].length>50){
				content+=infolink[i].substring(0,45)+"&#10;"+infolink[i].substring(45,infolink[i].length); 
			}
			else{
				content = infolink[i];
			}
			$("#ACRINFORMATIONSOURCES tbody").append("<tr class='list'><td width='20%'>" + checkBoxShow + "</td><td width='70%'>" + content + "</td><td width='10%'>" + "<a href='#'>show</a>" + "</td></tr>");
		}
	}
	
}

function updateValidationPolicies(){
	$("#TPOLICY").empty();
	var trDetailElements = $("#VALIDATIONPOLICIESDETAIL").children().children();
	for(var i = 0; i < trDetailElements.length;i++){
		if(i == 0){
			var tdElements = $(trDetailElements[i]).children();
			var tdElement = tdElements.get(1);
			var checkBoxElement = $(tdElement).children();
			if(checkBoxElement.get(0).checked==true){
				$("#TPOLICY").append("<tr><td>" + tdElement.innerHTML + "</td></tr>");
			}
		}
		else{
			if($(trDetailElements[i]).children().children().get(0).checked == true){
				$("#TPOLICY").append("<tr><td>" + $(trDetailElements[i]).children().get(0).innerHTML + "</td></tr>");
			}
		}
	}
	var trElements = $("#TPOLICY").children().children();
	for(var i = 0; i < trElements.length;i++){
		var checkBoxElement = $(trElements[i]).children().children();
		checkBoxElement.get(0).checked=true;
		checkBoxElement.get(0).disabled=true;
	}
}



function getProcedureList(tempGlobalProcID){
	var length = tempGlobalProcID.length;
	var globalProcID = new Array();
	for(var i = 0;i < length;i++){
		globalProcID[i] = tempGlobalProcID[i][0];
	}
	return globalProcID;
}
function getResults(arr){
	 var resultArr = new Array();
	 arr.sort(function(x, y){
	 		return compareStr(x[0], y[0]);
	 	}
	 );
	 for(var i = 0;i < arr.length;i++){
		resultArr[i] = arr[i][1];
	}
	return resultArr;
}

function getSortedResults(arr){
	 var resultArr = new Array();
	 for(var i = 0; i < arr.length;i++){
	 	arr[i] = arr[i].toUpperCase();
	 }
	 arr.sort(function(x, y){
	 		return x.charCodeAt(0) - y.charCodeAt(0);
	 	}
	 );
	 for(var i = 0;i < arr.length;i++){
		resultArr[i] = arr[i].toUpperCase();
	}
	return resultArr;
}

function getProcForTreeResults(arr){
	 var resultArr = new Array();
	 for(var i = 0;i < arr.length;i++){
		resultArr[i] = arr[i][0].substring(arr[i][0].indexOf("#")+1, arr[i][0].length);
	}
	return resultArr;
}
function compareStr(x, y){
	if(x == y){
		return 0;
	}
	else if(x > y){
		return 1;
	}
	else{
		return -1;
	}
}
function clearSelectProcedureTree(){
	$("#procedureTreeView .selectColor").each(function(){
		$(this).removeClass("selectColor");
	}	
	);
}

function getAllIndicationTreeView(container, rootNodeName, rootNodeID){
	$(container).append(getRootNode(rootNodeName, rootNodeID));
	$(container).Treeview({speed: "fast",
		toggle: function() {
			if(this.style.display=="block"){
				appendTreeForIndication($("#"+this.id));
			}
		}
	});
}
function appendTreeForIndication(node){
	var nodeElement = node.get(0);
	if(!nodeElement.hasChildNodes()){
		alert ("nodeID: "+nodeElement.id)
		getAllIndicationTreeData(node, nodeElement.id);
	}
}
function getAllIndicationTreeData(node, ulId){
	
	// get all indication by body parts
	
  	processRDF(server + "/acrListByBodyPart?", function(rdfXml) {	       
       var indUniqueBodyParts = getObjects(getRDFParser(rdfXml),"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#applyToAnatomicLocation");
	   
	   var RIDs = [];
	   var IndicationIDs = [];
	   for(var i = 0; i < indUniqueBodyParts.length;i++){
	      RIDs[i] = extractFragmentId(indUniqueBodyParts[i]);
	      IndicationIDs[i] = "Indication"+i; 	
	   }
	   
	 for(var i = 0; i < indUniqueBodyParts.length;i++){			
			node.append("<li id ='" + IndicationIDs[i] + "li'>" + "Indication for "+RIDs[i] + "<ul class = 'closed' id = '" + IndicationIDs[i] + "'></ul></li>");
		    loadIndicationSubTree("#" + IndicationIDs[i], RIDs[i]);
		}	
  	
  	
	$("#"+ ulId+" li").click(function(){
		var children = $(this).find(".selectColorForPathology");
		if(children.length == 0){
				$("#"+ ulId + " .selectColorForPathology").each(function(){
					$(this).removeClass("selectColorForPathology");
				});
				$(this).addClass("selectColorForPathology");
				selectTimeForPath=new Date().getTime();
				// aviod the children select start
				$(this).removeClass("unselectColorForPathology");
				var ulChildren = $(this).children("ul");
				if(ulChildren.length != 0){
					liChildren = $(ulChildren).children("li");
					if(liChildren.length != 0){
						for(var i = 0 ; i < liChildren.length;i++){
							$(liChildren).addClass("unselectColorForPathology");
						}
					}
				}
				// aviod the children select end
				if(this.lastChild.id != undefined){
					selectPathologyId = this.lastChild.id;
				}
				else{
					selectPathologyId = this.id;
				}
				if(this.childNodes.length > 1){
					selectPathology = this.childNodes[1].nodeValue;
				}
				else{
					selectPathology = this.childNodes[0].nodeValue;
				}
			}
			else{
				var flg = 0;
				$(".selectColorForPathology").each(function(){
					var time = new Date().getTime();
					if(time-selectTimeForPath >= 1000){
						flg = 1;
						$(this).removeClass("selectColorForPathology");
					}
				});
				if(flg == 1){
					// aviod the children select start
					$(this).removeClass("unselectColorForPathology");
					var ulChildren = $(this).children("ul");
					if(ulChildren.length != 0){
						liChildren = $(ulChildren).children("li");
						if(liChildren.length != 0){
							for(var i = 0 ; i < liChildren.length;i++){
								$(liChildren).addClass("unselectColorForPathology");
							}
						}
					}
					// aviod the children select end
					$(this).addClass("selectColorForPathology");
					selectTimeForPath = new Date().getTime();
					if(this.lastChild.id != undefined){
						selectPathologyId = this.lastChild.id;
					}
					else{
						selectPathologyId = this.id;
					}
					if(this.childNodes.length > 1){
						selectPathology = this.childNodes[1].nodeValue;
					}
					else{
						selectPathology = this.childNodes[0].nodeValue;
					}
					flg = 0;
				}
			}
	});
	$(node).Treeview({speed: "fast",
	    toggle: function() {
		}
     });
/*     for(var i = 0; i < indUniqueBodyParts.length;i++){			
			node.append("<li id ='" + IndicationIDs[i] + "li'>" + "Indication for "+RIDs[i] + "<ul class = 'closed' id = '" + IndicationIDs[i] + "'></ul></li>");
		    loadIndicationSubTree("#" + IndicationIDs[i], RIDs[i]);
		}

     */
           });
}
function selectProcedures() {
	var container = $(".tabs-hide");
		
		// select from list
		if(container.get(0).id == "PROCEDURETREE"){
			var trElement = $(".procedureSelected").get(0);
			if(trElement != undefined){
				var code = trElement.childNodes[0].firstChild.nodeValue;
				var desp = trElement.childNodes[1].firstChild.nodeValue;
				var procId = trElement.id.substring(0, trElement.id.length-2);
				var acr="";
				var accu="";
				var time = new Date().getTime();
				var select = $(".codehovered");
				if(select.length!=0){
					var trElement = select.get(0);
					trElement.childNodes[0].firstChild.nodeValue="CPT-"+code;
					trElement.childNodes[1].firstChild.nodeValue=desp;
					trElement.childNodes[2].firstChild.href="javascript:showDetails('" + procId + "')";
					trElement.childNodes[3].firstChild.href="javascript:showCTDIDetails('" + procId + "')";
					trElement.childNodes[4].firstChild.href="javascript:selectProcedureById('" + procId + "')";
					trElement.childNodes[5].firstChild.href="javascript:deleteById('" + procId + "')";
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "bodyParthidden' value='" + trElement.childNodes[2].firstChild.nodeValue + "'>");
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "hidden' value=''>");
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "remarkHidden' value=''>");
					trElement.id=procId;
				}
				else{
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "bodyParthidden' value='" + trElement.childNodes[2].firstChild.nodeValue + "'>");
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "hidden' value=''>");
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "remarkHidden' value=''>");
					$("#procedureListBody").append("<tr id = '" + procId + "'  class='codelist'><td class='showStyle'>CPT-" + code + "</td><td class='showStyle'>" + desp + "</td><td class='showStyle'><a href='javascript:showDetails(\"" + procId + "\")'>" + acr + "</a></td><td class='showStyle'><a href='javascript:showCTDIDetails(\"" + procId + "\")'>details</a></td><td class='showStyle' title='edit'><a href=\"javascript:selectProcedureById('" + procId + "');\"><img alt='edit' border='0' src='editicon.png' width='19' height='19'/></a></td><td class='showStyle' title='delete'><a href=\"javascript:deleteById('" + procId + "');\"><img alt='delete' border='0' src='images/DeleteIcon.png' width='19' height='19'/></a></td></tr>");

				}
			}
			else{
				alert("please choose the procedure!");
				return;
			}
		}
		// select from treeview
		else{
			if(procedureCode != ""){
				var code = procedureCode;
				var desp = procedureDesp;
				var acr="";
				var accu="";
				var procId = selectProcId;
				var time = new Date().getTime();
				//$("#procedureListBody").append("<tr id = '" + time + "'  class='codelist'><td class='showStyle'>" + code + "</td><td class='showStyle'>" + desp + "</td><td class='showStyle'>" + acr + "</td><td class='showStyle'><a href='javascript:showDetails(\"" + time + "\")'>details</a></td><td class='showStyle'>" + accu + "</td><td class='showStyle'><a href='javascript:showCTDIDetails(\"" + time + "\")'>details</a></td><td class='showStyle'><a href=\"javascript:deleteById('" + time + "');\"><img alt='delete' border='0' src='images/DeleteIcon.png' width='19' height='19'/></a></td></tr>");
				var select = $(".codehovered");
				if(select.length!=0){
					var trElement = select.get(0);
					trElement.childNodes[0].firstChild.nodeValue="CPT-"+code;
					trElement.childNodes[1].firstChild.nodeValue=desp;
					trElement.id=procId;
				}
				else{
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "bodyParthidden' value='" + procedureBody + "'>");
					$("#ARGUMENTATIONHIDDEN").append("<input type='hidden' id='" + procId + "hidden' value=''>");

					$("#procedureListBody").append("<tr id = '" + procId + "'  class='codelist'><td class='showStyle'>CPT-" + code + "</td><td class='showStyle'>" + desp + "</td><td class='showStyle'><a href='javascript:showDetails(\"" + procId + "\")'>" + acr + "</a></td><td class='showStyle'><a href='javascript:showCTDIDetails(\"" + procId + "\")'>details</a></td><td class='showStyle' title='edit'><a href=\"javascript:selectProcedureById('" + procId + "');\"><img alt='edit' border='0' src='images/editicon.png' width='19' height='19'/></a></td><td class='showStyle' title='delete'><a href=\"javascript:deleteById('" + procId + "');\"><img alt='delete' border='0' src='images/DeleteIcon.png' width='19' height='19'/></a></td></tr>");

				}
			}
			else{
				alert("please choose the procedure!");
				return;
			}
		}
}

function getSelectionIds(container, element) {
	var index = 0;
	var ids = new Array();
	$(container).each(function(){ 
		//alert ("node value: "+this.childNodes[element].nodeValue)
		//alert ("node id: "+this.childNodes[element].id)
		ids[index++] = this.id.substring(0, this.id.indexOf("-"));
	});
	return ids;
}


function selectIndications()
{
		var time = new Date().getTime();
		var select;
		var selectPlace = $(".selected").get(0);
		if(selectPlace.id == "INCLUSIONGRP"){
			select = $("#inListBody");
		}
		else{
			select = $("#exListBody");
		}
		var selectDrug = $("#BROSWER .selectColor").get(0);
		var selectDrugName;
		if(selectDrug.childNodes[1] != undefined){
			selectDrugName = selectDrug.childNodes[1].nodeValue;
		}
		else{
			selectDrugName = selectDrug.textContent;
		}
		var liElement = $("#BROSWER .selectColor").find("li");
		if(liElement.length != 0){
			select.append("<tr id='"+time+ "_" + selectDrug.id + "' class='codelist'><td class='showStyle'>" + selectDrugName + "<a onclick='openDetailInfo(\"" + selectDrug.id + "\")' href='#'><img border='0' src='images/warn.png'/></a>" + "</td><td class='showStyle'>" + selectProperty + "</td><td class='showStyle'><a href=\"javascript:deleteById('"+time+ "_" + selectDrug.id + "');\"><img alt='delete' border='0' src='images/DeleteIcon.png' width='19' height='19'/></a></td></tr>");
		}
		else{
			select.append("<tr id='"+time+ "_" + selectDrug.id + "' class='codelist'><td class='showStyle'>" + selectDrugName + "</td><td class='showStyle'>" + selectProperty + "</td><td class='showStyle'><a href=\"javascript:deleteById('"+time+ "_" + selectDrug.id + "');\"><img alt='delete' border='0' src='images/DeleteIcon.png' width='19' height='19'/></a></td></tr>");
		}
}
function openDetailInfo(id){
	window.open("drugList.html?id="+id,"newWindow" ,"height=510, width=500, top=400, left=500,toolbar=no, menubar=no, scrollbars=auto, resizable=no, location=no, status=no");
}

function selectTreeItem(container, type)
{
		//alert ("select tree item: " + container + ", type = " + type);
		
		var children = $("li", container).find(".selectColor");
		if(children.length == 0){
			$(container + " .selectColor").each(function(){
				$(this).removeClass("selectColor");
			});

			$(this).addClass("selectColor");
			selectTimeForAcr=new Date().getTime();
			var bodyId = this.id.substring(0, this.id.length-2);
			loadPropertyTree("#PROPERTY", this.childNodes[1].nodeValue, bodyId);
					
			// aviod the children select start
			$(this).removeClass("unselectColor");
			var ulChildren = $(this).children("ul");
			if(ulChildren.length != 0){
				liChildren = $(ulChildren).children("li");
				if(liChildren.length != 0){
					for(var i = 0 ; i < liChildren.length;i++){
						$(liChildren).addClass("unselectColor");
					}	
				}
			}// aviod the children select end
		
			selectId = this.lastChild.id;
			selectDrugName = this.childNodes[1].nodeValue;
		
		} else{
			var flg = 0;
			$("#BROSWER .selectColor").each(function(){
				var time = new Date().getTime();
				if(time-selectTimeForAcr >= 1000){
					flg = 1;
					$(this).removeClass("selectColor");
				}
			});
			
			if(flg == 1){
			// aviod the children select start
				$(this).removeClass("unselectColor");
				var ulChildren = $(this).children("ul");
				if(ulChildren.length != 0){
					liChildren = $(ulChildren).children("li");
					if(liChildren.length != 0){
						for(var i = 0 ; i < liChildren.length;i++){
							$(liChildren).addClass("unselectColor");
						}
					}
				}
				var bodyId = this.id.substring(0, this.id.length-2);
				loadPropertyTree("#PROPERTY", this.childNodes[1].nodeValue, bodyId);
				
				// aviod the children select end
				$(this).addClass("selectColor");
				selectTimeForAcr = new Date().getTime();
				selectId = this.lastChild.id;
				selectDrugName = this.childNodes[1].nodeValue;
				flg = 0;
			}
		}
	
    
}




function selectDemographicCriteria(container, category, value) 
{   
  var id = category ;
      id +=  (inclusionFlag)?"in":"ex";
  
  //delete the selection if the same item was previously in the table
  $('tr',container).each(function() 
  {          	      
 
      if ($(this).attr('id') == id) 
      {   
          deleteById(id);
          return false;
      }   
  });
  
  var entry = "<tr id = '" + id + "'  class='codelist'>" +
              "<td class='showStyle'>" + category + "</td>" +
              " <td class='showStyle'>" + value + "</td>" +
              " <td class='showStyle' title='delete'><a href=\"javascript:deleteById('" + id + "');\"><img alt='delete' border='0' src='images/DeleteIcon.png' width='19' height='19'/></a></td> " + 
              " </tr>";
           
  $(container).append(entry);
  
}

function clearCriteriaContainer()
{
    
    // clear pre-selection in criteria container
    $("INPUT[@type='text']", "#DRUG").each(function()
    {     
     $(this).val("");
    });
    
    $("INPUT[@type='checkbox']", "#PSEARCHCRITERIA").each(function()
    {    
      this.checked = false;
    });
    
    //$("#BROSWER").empty();
    //$("#PROPERTY").empty();
   
}

function clearCriteriaList()
{
    //clear all entries in inclusion and exclusion list
    $("tr", "#exListBody").each(function()
    {
    	deleteById(this.id);
    
    });
    $("tr", "#inListBody").each(function()
    {
    deleteById(this.id);
    });
    
}

function isNumeric(form_value) 
{ 
    if (form_value.match(/^\d+$/) == null) 
        return false; 
    else 
        return true; 
} 

function loadDrugTreeData() 
{
    // pre-load drug ontology
    
    


}



/* Bootstrap */
$(function() {
	$("#ADDIN").click(function() {			
		toggleDetailContainer("#DRUG");
		toggleSectionContainer("#INCLUSIONGRP");		
		inclusionFlag = true;	
		clearCriteriaContainer();	
	});
	
	$("#ADDEX").click(function() {			
		toggleDetailContainer("#DRUG");
		toggleSectionContainer("#EXCLUSIONGRP");		
		inclusionFlag = false;	
		clearCriteriaContainer();	

	});
	$("#APPLYBUTTON").click(function() {			
		selectIndications();
	});
	
	$("#querysql").click(function(){
		window.open("queryString.html","newWindow" ,"height=510, width=800, top=400, left=500,toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});
	
	$("#drugListSearch").click(function(){
		searchDrugList($("#drugSelectBox"), $("#drugName").val());	
	});
	
	$("#drugSearch").click(function(){
		//searchDrugTree("#BROSWER", $("#drugName").val());
		window.open("search.html","newWindow" ,"height=510, width=500, top=400, left=500,toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");		
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
	  				$(this).get(0).scrollIntoView(true);
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
	  			}
	  		);
			//$(element).removeClass("unselectColor");
			//$(element).addClass("selectColor");
			//window.opener.location='javascript:searchDrugTreeForHighlight("#BROSWER","' + selectBox.value+ '")';
			window.close();
		}
	});
	
	
	$("#CLEAR").click(function(){
		clearCriteriaContainer();	
	});
	
	$("INPUT[@type='checkbox']", "#PSEARCHCRITERIA").click(function(){		
		var container = (inclusionFlag)?"#Inclusion":"#Exclusion";
		selectDemographicCriteria(container, this.value, this.checked);
	});
    
    
    $("INPUT[@type='text']", "#PSEARCHCRITERIA").keypress(function(event) {		
		 if(event.keyCode == 13 )
		 {
		   if (isNumeric(this.value) && this.value > 0) {
				var container = (inclusionFlag)?"#Inclusion":"#Exclusion";
				selectDemographicCriteria(container, this.name, this.value);
				}				
			else {
				alert ("Please entry a valid number for " + this.name);
				this.value = "";
			}
		}
	});

	$("#PROPERTY li").click(function(){
		selectTreeItem("#PROPERTY", "subProperty");
	});

	
	$("#QUERYEXEC").click(function(){
		window.open("patientList.html");	
	});

	$("#DisplayAllDrug").click(function(){
		//searchDrugTree("#BROSWER", "General drug type");
		searchAllDrugTree("#BROSWER", "General drug type");
	})
	
	$("#RESET").click(function(){
		toggleDetailContainer("#DEFAULTCONT");
		clearCriteriaContainer();
		clearCriteriaList();
	})
	$(document).ready(
		function(){
			toggleDetailContainer("#DEFAULTCONT");
			inclusionFlag = false;
			clearCriteriaContainer();	
			loadDrugTreeData();
		}
	);
		
});


Array.prototype.uniqStr = function(){
 var o = {};
 var s = {};
 for (var i=0,j=0,k=0; i<this.length; i++){
  if (typeof o[this[i]] == 'undefined'){
   o[this[i]] = j++;
  }else{
   if(typeof s[this[i]]=='undefined'){
    s[this[i]]=k++;
   }
  }
 }
 this.length = 0;
 for (var key in o){
  this[o[key]] = key;
 }
 var r = [];
 for(var key in s){
  r[s[key]] = key;
 }
 return r;
}

