var blockUI = false;
var inclusionFlag = false;
var exclusionFlag = false;
var defaultNameSpace = "http://www.w3.org/2002/07/owl#";



var dataNode;
var patientIdList = [];
var patientNamelist = [];
var patientBirthdayList = [];
var patientGenderList = [];
var selectAnatomy="&nbsp;";
var selectAnatomyId="&nbsp;";
var selectPathology="&nbsp;";
var selectPathologyId="&nbsp;";
var procedureCode="";
var procedureDesp="";
var procedureBody="";
var selectTimeForAcr="";
var selectTimeForPath="";
var selectTimeForProc="";
var globalProcTypes, tempProcTypes;
var globalProcID;
var globalProcBodyParts, tempProcBodyParts;
var globalProcNames;
var globalProcCPTs;
var globalProcRadIDs;
var globalSelectedBodyParts;
var ProcedureTableLoadFlag = 0;
var procedureTreeViewLoadFlag = 0;
var loadPathologyTreeFlg = 0;
var loadAnatomyTreeFlg = 0;
var selectProcId="";
var idForAnatomyTree;
var tempProcTypesForTreeView;
var unBlockUIFlg = "0";
var treeLoadFlag = "0";
var searchAnatomy = "";



	
/* Show/hide the wait cursor 
 * or show a wait message */
function showWait(wait) {
	if (wait) {
		if (blockUI) {
			$.blockUI("<p><img src='js/busy.gif' /> <strong>Please wait...</strong></p> ");
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
	getDetailInfo(trElem);
}

function getDetailInfo(trElem){
	//alert(trElem.childNodes.length);
	$("#patientName").attr({ value: trElem.childNodes[1].innerHTML});
	$("#firstName").attr({ value: trElem.childNodes[2].innerHTML});
	$("#Birthday").attr({ value: trElem.childNodes[3].innerHTML});
	$("#Gender").attr({ value: trElem.childNodes[4].innerHTML});
	$("#phone").attr({ value:""});
	$("#street").attr({ value:""});
	$("#nPoint").attr({ value:""});
	$("#postalCode").attr({ value:""});
	$("#city").attr({ value:""});
	$("#state").attr({ value:""});
	$("#country").attr({ value:""});
}

/* Extract the fragment id from the given URI */
function extractFragmentId(uri) {
	var i = uri.indexOf("#")
    if (i < 0) {
    	i = uri.indexOf("/");
    }
    if (i <0) {
    	return ""
    }
    return uri.slice(i+1,uri.length)
}

/* if has child return the data that is greater than 0,else return 0*/
function itemHasChild(uri) {
	return "0";
}

/* Transform the N3 retrieved from the URL to RDF/XML and process it in the callback function. */
/**function processRDF(url, callback) {
	try {
		$.post("/JENA2", { URL: url, CONVERSION: "N3 RDF/XML" }, function(rdfXml) {
			callback(rdfXml);
		});
	} catch (e) {
		alert("ERROR [processRDF] " + e);
	}
}
*/

//sync execution of callback

function process(url, callback) {
	try {
		$.ajaxSync({url: "/POST", type: "POST", data: { URL: url }, success: function(n3) {
			try {
				callback(n3);
			} catch (e) {
				alert("ERROR [ajax] " + e.message);
			}
		}});
	} catch (e) {
		alert("ERROR [process] " + e.message);
	}
}




function addNamespace(resource) {
	return resource.replace(/:/g, defaultNameSpace);
}


/* Returns the elements of the N3 list */
function getList(resource) {
	var list;
	var pattern = "[<:\\w/#>e\\-\\+\\.]+";
	var regex = new RegExp(pattern, "g");
	list = resource.match(regex);
	return list;
}

/* Returns the first element of the N3 list */
function getHeadOfList(resource) {
	return getList(resource)[0];
}

/* Returns the subject of the N3 triple statement */
function getSubject(statement) {
	var subjects;
	var pattern = "([\\(<:\\w\\s/#>e\\-\\+\\.\\)]+)\\s+[<:\\w\\./#>]+\\s+[\\(<:\\w\\s/#>e\\-\\+\\.\\)]+\\.";
	var regex = new RegExp(pattern);
	subjects = statement.match(regex);
	return subjects[1];
}

/* Returns the object of the N3 triple statement */
function getObject(statement) {
	var objects;
	var pattern = "(\"[\\w\\s]+\")";
	var regex = new RegExp(pattern);
	objects = statement.match(regex);
	return objects[1];
}

/* Returns an array with the statements having the 'property' predicate. */
function getStatements(n3, property) {
	var statements = [];
	//var pattern = "\\(\\d\\.?\\d*e?\\-?\\+?\\d*\\)\\s" + property + "\\s[\\(<:\\w\\s>/\\)]+\\.";
	
	var pattern = "\\(\\.\)\\s" + property + "\\s[\\(<:\\w\\s>/\\)]+\\.";
	
	var regex = new RegExp(pattern, "g");
	statements = n3.match(regex);
	
	if (statements == null) {
		statements = [];
	}
	
	// add namespace
	//for (index = 0; index < statements.length; index++) {
	//	statements[index] = addNamespace(statements[index]);
	//}
	return statements;
}

function hasBodyPartName(id, A) {
	//check if id is an element of array A, if yes, return 1, otherwise, return 0
	for (var i=0; i< A.length; i++)
			if (A[i][1].match(id) != null) return 1;	
	return 0;
}

function getBodyPartsNameByProcedureID(procIDs){
	var bodyPartIDNameArr = [];
	var k = 0;
	for(var i = 0;i < procIDs.length;i++){
		for(var j = 0; j < globalProcID.length;j++){
			if (extractFragmentId(globalProcID[j]) == procIDs[i]){
                if (hasBodyPartName(globalProcBodyParts[j], bodyPartIDNameArr) == 0)
                  {
                  	bodyPartIDNameArr.push([extractFragmentId(globalProcRadIDs[j]), globalProcBodyParts[j]]);
                  	break;
                  }	
			}   
		}       
	}           
	
    return bodyPartIDNameArr;
}              
                  


function ontologyTreeView(container){
	$("#BROSWER").empty();
 	
 	//test date for drug names
 	
	var dnameArr = [];	
	dname.push(["Metformin", "C0005382"]);
	dname.push(["Anticoagulant antagonist", "C1638316"]);
	dname.push(["Warfarin", "C0043031"]);
			
		
	var dLength = dname.length;
	
	for (var i = 0; i<dLength; i++){
		// this algorithm can have problem because when use RID as dom element ID, it can be used somewhere else, make sure to put time stamp on
		$("#BROSWER").append(getRootNode(dname[i][1], dname[i][0]));
	}

	$("#BROSWER li").click(function(){
		var children = $(this).find(".selectColor");
		if(children.length == 0){
			$("#BROSWER .selectColor").each(function(){
				$(this).removeClass("selectColor");
			});
			$(this).addClass("selectColor");
			selectTimeForAcr=new Date().getTime();
			var bodyId = this.id.substring(0, this.id.length-2);
			loadPathologyTree("#pathology", this.childNodes[1].nodeValue, bodyId);
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
			// aviod the children select end
			selectAnatomyId = this.lastChild.id;
			selectAnatomy = this.childNodes[1].nodeValue;
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
				loadPathologyTree("#pathology", this.childNodes[1].nodeValue, bodyId);
				// aviod the children select end
				$(this).addClass("selectColor");
				selectTimeForAcr = new Date().getTime();
				selectAnatomyId = this.lastChild.id;
				selectAnatomy = this.childNodes[1].nodeValue;
				flg = 0;
			}
		}
	});
	$("#BROSWER").Treeview({speed: "fast",
		toggle: function() {
			if(this.style.display=="block"){
				appendTree($("#"+this.id));
			}
		}
	});
}

function loadIndicationSubTree(container, bodyID) {
	
/**	
  //get indication from ACR2007.n3
  var selection = "@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
	
	selection +=  "radlex:" + bodyID + "   a :selectBodyPart. \n"
	
	//alert('loading indication: selection = '+selection)
	
	selection = "http://localhost/.context" + encodeURIComponent(" " + selection);	
	
	
	var pquery = 	"@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    				"{?A 	a :selectBodyPart. \n" + 
    				" ?B    :hasLocativeAttribute ?A;  \n" +
    				"       rdfs:label    ?C } \n" +
    				"  => \n" +
 			       	"{?B 	rdfs:label   ?C}. \n"  

    //alert('loading indication: query = '+pquery)
  	pquery = "http://localhost/.context" + encodeURIComponent(" " + pquery);				
  	
  	processRDF("http://localhost/Indication?location="+encodeURIComponent(selection)+"&query="+encodeURIComponent(pquery), function(rdfXml) {	       

       */
    //get indication from acr database   
    processRDF("http://localhost/acrIndicationByBodyPart?RID="+bodyID, function(rdfXml) {	          
               var pathoItem = getSubjectObjects(getRDFParser(rdfXml),"http://www.w3.org/2000/01/rdf-schema#label");
	    
       
		//need to sort according pathoItem[index][1]
		//pathoItem.sort();
		
		var k = pathoItem.length;
		
		
		if(k > 0){
			for(var i = 0;i < k;i++){
				var itemID = extractFragmentId(pathoItem[i][0]);
				var s = "<li id='" + itemID +"' class='closed unselectColorForPathology'>" + pathoItem[i][1] + "</li>"
				$(container).append(s);
			}
			$(container+" li").click(function(){
			var children = $(this).find(".selectColorForPathology");
			if(children.length == 0){
					$("#pathology .selectColorForPathology").each(function(){
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
					$("#pathology .selectColorForPathology").each(function(){
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
			$(container).Treeview({speed: "fast",
			toggle: function() {
		}
		});
		}
		else 
		{
			//alert ("no indication specific to this location")
		}
  	});
}		

function loadPathoSubTree(container, bodyID)  {
	
	//load galen pathological phenonemon for the body part
	
	var selection = "@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
	
	selection +=  "radlex:" + bodyID + "   a :selectBodyPart. \n"
	
	//alert('loading indication: selection = '+selection)
	
	selection = "http://localhost/.context" + encodeURIComponent(" " + selection);	
	
	
	var pquery = 	"@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    				"{?A 	a :selectBodyPart. \n" + 
    				" ?B    :hasLocativeAttribute ?A;  \n" +
    				"       rdfs:label    ?C } \n" +
    				"  => \n" +
 			       	"{?B 	rdfs:label   ?C}. \n"  

    //alert('loading indication: query = '+pquery)
  	pquery = "http://localhost/.context" + encodeURIComponent(" " + pquery);				
  	
  	processRDF("http://localhost/Indication?location="+encodeURIComponent(selection)+"&query="+encodeURIComponent(pquery), function(rdfXml) {	       
       var pathoItem = getSubjectObjects(getRDFParser(rdfXml),"http://www.w3.org/2000/01/rdf-schema#label");
	    
       
		//need to sort according pathoItem[index][1]
		//pathoItem.sort();
		
		var k = pathoItem.length;
		
		
		if(k > 0){
			for(var i = 0;i < k;i++){
				//alert ("itemID:" +pathoItem[i][0]+ ", Label: "+pathoItem[i][1])
				var itemID = extractFragmentId(pathoItem[i][0]);
				//var itemLabel = extractFragmentId(pathoItem[i][1]);
				var s = "<li id='" + itemID+ i+"' class='closed unselectColor'>" + pathoItem[i][1] + "</li>"
				//alert('loading indication: pathoItem = '+ s)
				$(container).append(s);
				$("#Patho li").click(function(){
					var children = $(this).find(".selectColorForPathology");
					if(children.length == 0){
							$("#pathology .selectColorForPathology").each(function(){
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
							$("#pathology .selectColorForPathology").each(function(){
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
			}
		}
		else 
		{
			alert ("no indication specific to this location")
		}
  	});
}

function loadPathologyTree(container, bodyLocation, bodyID) {
	var nodeValue ="";
	if($(container).get(0).childNodes.length > 0){
		nodeValue = $(container).get(0).firstChild.childNodes[1].nodeValue;
	}
	if("Indications for "+bodyLocation != nodeValue){
		$(container).empty();
		
		//get indications that have bodyLocation as their "hasLocativeAttribute"
		$(container).append(getRootNode("Indications for "+bodyLocation, "Indication"));
		//$(container).append(getRootNode("Pathology Phenonmenon ", "Patho"));
		
		$(container).Treeview({speed: "fast",
				toggle: function() {
			}
			});
		//load indicaiton list (from ACR and UMMS reason for study list)
		loadIndicationSubTree("#Indication", bodyID);
		
		//load pathology phenonmenon of Galen
		//loadPathoSubTree("#Patho", bodyID);
	}
}



// get Tree root node for ontology tree
function getRootNode(rootNodeName, rootNodeID){
	var stree = "<li id='" + rootNodeID + "li' class='closed'>"+rootNodeName;
    stree=stree+"<ul id='" + rootNodeID + "'>";
    stree=stree+"</ul>";
    stree=stree+"</li>";
    return stree;
}

// replace the space by & for bodypart id
function getRootNodeForCTDI(rootNodeName){
	var nodeValueForId = rootNodeName;
	while(nodeValueForId.indexOf(" ") != -1){
		nodeValueForId = nodeValueForId.substring(0, nodeValueForId.indexOf(" ")) + "1" + nodeValueForId.substring(nodeValueForId.indexOf(" ") + 1, nodeValueForId.length);
	}
	var stree = "<li id='" + nodeValueForId + "li' class='closed'>"+rootNodeName;
    stree=stree+"<ul id='" + nodeValueForId + "'>";
    stree=stree+"</ul>";
    stree=stree+"</li>";
    return stree;
}



// append tree method
function appendTree(node){
	var nodeElement = node.get(0);
	if(!nodeElement.hasChildNodes()){
		getTreeData(node, nodeElement.id);
	}
}

// append tree method
function appendTreeForPathology(node){
	var nodeElement = node.get(0);
	if(!nodeElement.hasChildNodes()){
		getTreeDataForPathology(node, nodeElement.parentNode.childNodes[1].nodeValue);
	}
}

//get tree node function value is the node text value
function getTreeData(node, value){
   
   alert ("get sub tree data: node" + node +", value ="+value );
  	
    showWait(true);
    
  	process("http://localhost/doSubName?drugClass="+encodeURIComponent(value), function(n3) {
        
		try{			
			var subItemsName = getStatements(n3, "rdfs:label");
			//alert ("subitems no "+subItemsName.length)
			var subValue;
			
			if (subItemsName.length > 0) { 
				for (var i = 0; i < subItemsName.length; i++)
					{
						var nodeID = extractFragmentId(subItemsName[i][0]);
						var nodeValue = subItemsName[i][1];                
						node.append("<li id='" + nodeID + "li' class='closed unselectColor'>" + nodeValue + getTempNode(nodeID) + "</li>");
					}
			}
			else
				alert ("There is no sub-items for this node")
			
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
						loadPathologyTree("#pathology", this.childNodes[1].nodeValue, bodyId);
						// aviod the children select end
						$(this).addClass("selectColor");
						selectTimeForAcr = new Date().getTime();
						if(this.lastChild.id != undefined){
							selectAnatomyId = this.lastChild.id;
						}
						else{
							selectAnatomyId = this.id;
						}
						if(this.childNodes.length > 1){
							selectAnatomy = this.childNodes[1].nodeValue;
						}
						else{
							selectAnatomy = this.childNodes[0].nodeValue;
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
							loadPathologyTree("#pathology", this.childNodes[1].nodeValue, bodyId);
							// aviod the children select end
							$(this).addClass("selectColor");
							selectTimeForAcr = new Date().getTime();
							if(this.lastChild.id != undefined){
								selectAnatomyId = this.lastChild.id;
							}
							else{
								selectAnatomyId = this.id;
							}
							if(this.childNodes.length > 1){
								selectAnatomy = this.childNodes[1].nodeValue;
							}
							else{
								selectAnatomy = this.childNodes[0].nodeValue;
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

function getTreeDataForPathology(node, value){
	//alert ("value : " + value)
	if(node.get(0).childNodes.length == 0){

		var ulId = node.get(0).id;

		$("#" + ulId + " li").click(function(){
			var children = $(this).find(".selectColorForPathology");
			if(children.length == 0){
				$("#pathology .selectColorForPathology").each(function(){
					$(this).removeClass("selectColorForPathology");
				});
				
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
			}
			else{
				var flg = 0;
				$("#pathology .selectColorForPathology").each(function(){
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
	}
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

// get Tree view
function getTreeView(node){
	node.Treeview({speed: "fast",
		toggle: function() {
			if(this.style.display=="block"){
				appendTree($("#"+this.id));
			}
		}
	});
	
}

// get Tree view for pathology
function getTreeViewForPathology(node){
	node.Treeview({speed: "fast",
		toggle: function() {
			if(this.style.display=="block"){
				appendTreeForPathology($("#"+this.id));
			}
		}
	});
	
}

// get temp node string
function getTempNode(item){
	return "<ul id=" + item + "></ul>"
}

function toggleDetailContainer(name){    
	$(".showDetails").hide();
	//$(".anatomyTree").hide();
	$(name).show();
}
function toggleSectionContainer(name) {
	$(".selected").attr("class","unselected");
	$(name).attr("class","selected");
}

function doSearch(){
	var id = $("#id").get(0).value;
	var birthday = $("#birthday").get(0).value;
	var name = $("#name").get(0).value;
	$("#SPLIST tbody").empty();
	SearchPatientList(id, name, birthday);
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

function selectProcedureById(id){
	toggleDetailContainer("#PROCEDUREDETAIL");
	toggleSectionContainer("#PROCEDURECONTAINER");
	var trElement = $("#" + id).get(0);
	$(".codehovered").each(function(){
			this.className = "codelist";
		}
	);
	trElement.className='codehovered';
	clearProcedureSelection();
}

function deleteById(id){
	$("#"+id).remove();
}

function clearTheSearchInfo(){
	$("#id").get(0).value="";
	$("#birthday").get(0).value="";
	$("#name").get(0).value="";
}
function clearACRCodeSelect(){
	$(".codehovered").each(function(){
			this.className = "codelist";
		}
	);
}



function searchTree(container, nodeValue){
	$(container).empty();	
	
	showWait(true);    
   		
  	process("http://localhost/doNames?drugName="+encodeURIComponent(nodeValue), function(n3) {
  		
  		var foundTerms = getStatements(n3,"rdfs:label");
		
		alert ("found Terms: "+foundTerms.length);
		
		
		
		
		var foundTermsList = new Array();
	for (var index = 0; index < foundTerms.length; index++) {		
		var problem = getObject(triples[index]);
		foundTermsList.push(problem);
	}
	
		
		
		
		
		
		
		
		alert ("found Terms: "+foundTerms.length);
		if (foundTerms.length > 0)
		{
			for(var i = 0;i < foundTerms.length; i++){
				var foundID = extractFragmentId(foundTerms[i][0]);
				var foundName = foundTerms[i][1];
				//alert (foundID + ', '+ foundName);		
				$(container).append(getRootNode(foundName, foundID));
			}
			$("#BROSWER li").click(function(){
				var children = $(this).find(".selectColor");
				if(children.length == 0){
					$("#BROSWER .selectColor").each(function(){
						$(this).removeClass("selectColor");
					});
					$(this).addClass("selectColor");
					selectTimeForAcr=new Date().getTime();
					var bodyId = this.id.substring(0, this.id.length-2);
					//loadPathologyTree("#pathology", this.childNodes[1].nodeValue, bodyId);
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
					// aviod the children select end
					selectAnatomyId = this.lastChild.id;
					selectAnatomy = this.childNodes[1].nodeValue;
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
						loadPathologyTree("#pathology", this.childNodes[1].nodeValue, bodyId);
						// aviod the children select end
						$(this).addClass("selectColor");
						selectTimeForAcr = new Date().getTime();
						selectAnatomyId = this.lastChild.id;
						selectAnatomy = this.childNodes[1].nodeValue;
						flg = 0;
					}
				}
			});
            $(container).Treeview({speed: "fast",
	            toggle: function() {
		        if(this.style.display=="block"){
			           appendTree($("#"+this.id));
		        	}
				}
            });
		}
		else{
			$(container).append("no drug name found");
			alert ("not found in drug ontology");
		}
		showWait(false);
		
	});
			
	//searchAnatomy = nodeValue;
	
	
}
function searchIndicationTree(container, nodeValue){
	$(container).empty();
	alert ("searching indication: "+nodeValue);
	$.blockUI("<p><img src='js/busy.gif' /> <strong>Please wait...</strong></p> ");
	var pquery = 	"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix : <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +    				
    				"{?A 	:Preferred_Name "+ nodeValue + ".}\n" +
 					"  => \n" +
 			       	"{?A 	:Preferred_Name "+ nodeValue + ".}\n";
    //alert (pquery);
    
    pquery = "http://localhost/.context" + encodeURIComponent(" " + pquery);				
  	processRDF("http://localhost/radlexBodyParts?query="+encodeURIComponent(pquery), function(rdfXml) {
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

function getTreeDataForIncation(node, ulId){
	
	//alert ("getting Tree data for indications: ulId = " + ulId);
	var IndicationSubData = [["testData1", "testData1"], ["testData2", "testData2"], ["testData3", "testData3"]];
	for(var i = 0; i < IndicationSubData.length;i++){
		node.append("<li id ='" + IndicationSubData[i][0] + "'>" + IndicationSubData[i][1] + "</li>");
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
	
}

function getProcedures(){
/**var pquery = 	"@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    				"@prefix ACR2007: <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n" +
    				"{?A 	:procedureType ?PType;\n" +
    				"       :bodyPart   ?radName; \n" +
 			       	"     	:applyToAnatomicLocation    ?B; \n" +
					"       :hasCPTCode ?Code; \n" +
					"		rdfs:label ?S}  => \n" +
 			       	"{?A 	:bodyPart   ?radName; \n" +
 			       	"     	:radCode    ?B; \n" +
					"       :procedureType ?PType;\n" +
					"       :hasCPTCode ?Code; \n" +
					"		rdfs:label ?S}.\n " 
					
  	//alert(pquery);
  	pquery = "http://localhost/.context" + encodeURIComponent(" " + pquery);				
  	processRDF("http://localhost/ProcList?query="+encodeURIComponent(pquery), function(rdfXml) {
  	
  	globalProcTypes = getObjects(rdfXml,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#procedureType");
  	
  	var tempProcTypes = getObjects(rdfXml,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#procedureType");
  	globalProcBodyParts = getObjects(rdfXml, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#bodyPart");
  	var tempProcBodyParts = getObjects(rdfXml, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#bodyPart");
	globalProcNames = getObjects(rdfXml, "http://www.w3.org/2000/01/rdf-schema#label");
	globalProcCPTs = getObjects(rdfXml, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#hasCPTCode");
    globalProcRadIDs = getObjects(rdfXml, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#radCode");
   

     */ 
	ProcedureTableLoadFlag = 1;
	var uniqueProcType = tempProcTypes.uniqStr();
	var uniqueBodyPart = tempProcBodyParts.uniqStr();
	uniqueProcType = getSortedResults(uniqueProcType);
	uniqueBodyPart = getSortedResults(uniqueBodyPart);
	
	$("#ModalityTable").empty();
	$("#bodyPartTable").empty();
	var procTypeLength = uniqueProcType.length;
	var bodyPartsLength = uniqueBodyPart.length;
	
	//add "any" - general type for modality and body parts
	if(procTypeLength > 0){
		var appendStr = "<option value=''>Any</option>";
		for(var i = 0;i < procTypeLength;i++){
			appendStr = appendStr + "<option value='" + uniqueProcType[i] + "'>" + uniqueProcType[i]+ "</option>"
		}
		$("#Modality").append(appendStr);
		$("#Modality").get(0).options[0].selected = true;
		
		$("#Modality").change(function() {
			searchProcedures();	
		});
	}
	if(bodyPartsLength > 0){
		var appendStr = "<option value=''>Any</option>";
		for(var i = 0;i < bodyPartsLength;i++){
			appendStr = appendStr + "<option value='" + uniqueBodyPart[i] + "'>" + uniqueBodyPart[i]+ "</option>"
		}
		$("#bodyPart").append(appendStr);
		$("#bodyPart").get(0).options[0].selected = true;
		
		$("#bodyPart").change(function() {
			searchProcedures();	
		});
	}
	searchProcedures();

}

function searchProcedures() {
    var modalityValue=$("#Modality").get(0).value;
	var bodyPartValue=$("#bodyPart").get(0).value;;  
	var codeValue = $("#Code").get(0).value;
	var descriptionValue = $("#Description").get(0).value;
	
	$("#PROCEDURELIST tbody").empty();

	for(var i = 0;i < globalProcCPTs.length;i++){
		if(codeValue != ""){
			if(globalProcCPTs[i].indexOf(codeValue) != 0){
				continue;
			}
		}
		if(descriptionValue != ""){
			if(globalProcNames[i].toUpperCase().indexOf(descriptionValue.toUpperCase()) != 0){
				continue;
			}
		}
		if(modalityValue != ""){
			if(globalProcTypes[i].indexOf(modalityValue) != 0){
				continue;
			}
		}
		if(bodyPartValue != ""){
			if(globalProcBodyParts[i].toUpperCase().indexOf(bodyPartValue.toUpperCase()) != 0){
				continue;
			}
		}
		var procId = extractFragmentId(globalProcID[i]);
		//procId = globalProcID[i];
		$("#PROCEDURELIST tbody").append("<tr class='procedurelist' id='" + procId + "tr'><td>" + globalProcCPTs[i] + "</td><td>" + globalProcNames[i] + "</td><td>" + globalProcBodyParts[i] + "</td><td>" + extractFragmentId(globalProcRadIDs[i]) + "</td></tr>");
	}
	var trs =$("#PROCEDUREBODY tr"); 
	for(var j=0, len=trs.length; j<len; j++) 
	{
		trs[j].onmouseover=function() {
			if(this.className != "procedureSelected"){
				this.className='procedurehovered';
			}
		}
		trs[j].onmouseout=function() {
			if(this.className != "procedureSelected"){
				this.className='procedurelist';
			}
		}
	}
	
	$("#PROCEDUREBODY tr").click(
		function(){
			$(".procedureSelected").each(
				function(){
					this.className="procedurelist";
				}
			)
			this.className="procedureSelected";
		}
	);
 }

function clearProcedureSelection(){
	$("#Code").get(0).value ="";
	$("#Description").get(0).value="";
	//$("#PROCEDUREBODY").empty();
	$("#PROCEDURELIST .procedureSelected").each(function(){
		$(this).removeClass("procedureSelected");
		$(this).addClass("procedurelist");
	}
	)
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
function getProcAttributesByIndex(globalArray, procIndex) {
	var attributes = new Array();
	var index = 0, k = procIndex.length;
	
	for (var i = 0; i < k; i++) {
		var m = procIndex[i];
		attributes[index++] = globalArray[m];		
	}
	return attributes;
}

function getTempNodeForProcedure(item, ptype){
	return "<ul id='" + item  + ptype + "Procedure'></ul>"
}
function getProcedureByType (node, ptype)
{

	    var procIndex = getProcIndexByProcType(ptype);

	    var procBodyParts = getProcAttributesByIndex(globalProcBodyParts, procIndex);
	    var tempProcBodyParts = getProcAttributesByIndex(globalProcBodyParts, procIndex);
	    var unipProcBodyParts = tempProcBodyParts.uniqStr();
	    
	    var procedureIds = getProcAttributesByIndex(globalProcID, procIndex);
	    var procCPT = getProcAttributesByIndex(globalProcCPTs, procIndex);
	    var procNames = getProcAttributesByIndex(globalProcNames, procIndex);
	    
	    
		for (var i = 0; i < unipProcBodyParts.length; i++)
		{
			// get the subItem id
			var flg = 0;
			
			
			var nodeValue = unipProcBodyParts[i];
			var nodeID = unipProcBodyParts[i];
			var nodeValueForId = nodeValue;
			while(nodeValueForId.indexOf(" ") != -1){
				nodeValueForId = nodeValueForId.substring(0, nodeValueForId.indexOf(" ")) + nodeValueForId.substring(nodeValueForId.indexOf(" ") + 1, nodeValueForId.length);
			}
			for(var j = 0; j < procBodyParts.length;j++){
				if(procBodyParts[j] == nodeValue){
					
					var time = new Date().getTime();
					var childNodeValue = procNames[j];
					var ChildNodeID = procCPT[j] + "&" + time;
					if($("#"+ nodeValueForId+ptype).length == 0){
						node.append("<li id='" + nodeValueForId + ptype + "' class ='closed'>" + nodeValue + getTempNodeForProcedure(nodeValueForId, ptype) + "</li>");
					}
					var leafProcedureId = extractFragmentId(procedureIds[j]);
					$("#"+nodeValueForId + ptype +"Procedure").append("<li id='" + leafProcedureId + "tree' class='final'>" + childNodeValue + "(" + procCPT[j] + ")</li>");
				}
				
			}
			/*if($("#"+ nodeValueForId).length == 0){
				node.append("<li id='" + nodeID + i + "'>" + nodeValue+"</li>");
			}*/
			$("#" + nodeValueForId + ptype + "Procedure li").click(function(){
				$(".selectColor").each(function(){
					$(this).removeClass("selectColor");
				});
				$(this).addClass("selectColor");
				selectProcId = this.id.substring(0, this.id.length-4);
				procedureCode = this.textContent.substring(this.textContent.indexOf("(")+1, this.textContent.length-1);
				procedureDesp = this.textContent.substring(0, this.textContent.indexOf("("));
				procedureBody = this.parentNode.parentNode.childNodes[1].nodeValue;
				//alert ("procedureBody: " + procedureBody);
			});
		}
		
		//getTreeViewForProcedure(node);
		//$.unblockUI();

}


function appendTreeForProcedure(node){
	var nodeElement = node.get(0);
	if((nodeElement != undefined) && (!nodeElement.hasChildNodes())){
		getProcedureByType(node, nodeElement.id);
	}
}
function getTreeDataForProcedure(node, value){
	// add the get childNodes of the node
	
	getTreeViewForProcedure(node);
	var ulId = node.get(0).id;
	$("#" + ulId + " li").click(function(){
		var children = $(this).find(".selectColor");
		if(children.length == 0){
			$(".selectColor").each(function(){
				$(this).removeClass("selectColor");
			});
			$(this).addClass("selectColor");
			procedureCode = this.lastChild.id;
			procedureDesp = this.childNodes[1].nodeValue;
		}
	});
}

function getTreeViewForProcedure(node, ptype){
	node.Treeview({speed: "fast"
		/*,
		toggle: function() {
			if(this.style.display=="block"){
				appendTreeForProcedure($("#"+this.id));
			}
		}*/
	});
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

function showInfoInDetailList(){
	$("#ACRINFORMATIONSOURCES tbody").empty();
	var trDetailElements = $("#VALIDATIONPOLICIESDETAIL").children().children();
	for(var i = 0; i < trDetailElements.length;i++){
		if(i == 0){
			var tdElements = $(trDetailElements[i]).children();
			var tdElement = tdElements.get(1);
			var checkBoxElement = $(tdElement).children();
			if(checkBoxElement.get(0).checked==true){
				var checkBoxShow = checkBoxElement.get(0).nextSibling.nodeValue;
				var content = "";
				if(infolink[i].length>50){
					content+=infolink[i].substring(0,45)+"&#10;"+infolink[i].substring(45,infolink[i].length); 
				}
				else{
					content = infolink[i];
				}
				$("#ACRINFORMATIONSOURCES tbody").append("<tr class='list'><td>" + checkBoxShow + "</td><td>" + content + "</td><td>" + "<a href='#'>show</a>" + "</td></tr>");
			}
		}
		else{
			if($(trDetailElements[i]).children().children().get(0).checked == true){
				var tdElement = $(trDetailElements[i]).children().get(0);
				var checkBoxElement = $(tdElement).children();
				var checkBoxShow = checkBoxElement.get(0).nextSibling.nodeValue;
				var content = "";
				if(infolink[i].length>50){
					content+=infolink[i].substring(0,45)+"&#10;"+infolink[i].substring(45,infolink[i].length); 
				}
				else{
					content = infolink[i];
				}
				$("#ACRINFORMATIONSOURCES tbody").append("<tr class='list'><td>" + checkBoxShow + "</td><td>" + content + "</td><td>" + "<a href='#'>show</a>" + "</td></tr>");
			}
		}
	}
}

//get patietn SCL
function getPatientSCL(patientId)
{
	 processRDF("http://localhost/patientSCL?patientID="+patientId, function(rdfXml) {	  
	 	var scl = getObjects(getRDFParser(rdfXml), "http://localhost/RPGDemo/tripleStore/patients#scl");
	 	if (scl.length > 0) globalPatientSCL = scl[0];
	    else globalPatientSCL = "0";
	    
	 });     
    
}

// calculate ACR Score, return the highest score
function calculateACRScore(patientId, procedureId, indicationIds, tdElement){
 // this array contains the policy data
 var policyArray = new Array();
 var policyCount = 0;
 var policies = " ";

//alert ("PID=" + patientId +" , procedure id= "+ procedureId + " ,indicationID = " + indicationIds);
 // get policy selection 
 $("#TPOLICY tbody td input[@type='checkbox']").each(function(){
	policyArray[policyCount++] = this.nextSibling.nodeValue;	
 });
 
// get policy files

  for (var j = 0; j < policyCount; j++)
  {
  	var policyName = policyArray[j];
  	if (policyName.indexOf("ACR") != -1)
  	   policies += " http://localhost/RPGDemo/tripleStore/validationRules.n3"
  	else if (policyName.indexOf("Contra-indication") != -1)
  	   policies += " http://localhost/RPGDemo/tripleStore/contraAlertRules.n3"
//  	else if (policyName.indexOf("Reimbursement") != -1)
//  	   policies += " http://localhost/RPGDemo/tripleStore/insuranceRules.n3"
  	else
  	   alert ("can not find policy file for validation: " + policyName);
  }
  
  //alert (encodeURIComponent(" "+policies));
 
  var selection = "@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
	
	selection +=  ":" + procedureId + "   a :selectedProcedure. \n";
	for (var i = 0; i < indicationIds.length; i++)
	 selection +=  ":" + indicationIds[i] + "   a :selectedIndication. \n";
	 
	selection = "http://localhost/.context" + encodeURIComponent(" " + selection);	
	
	
	$.blockUI("<p><img src='js/busy.gif' /> <strong>validating order...</strong></p> ");
		
	var pquery = 	"@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    				"{?P     :applyToIndication  ?indication_m; \n" +
                    "        :maxACRScore ?score_m;    \n" +
                    "        :withComments ?comments_m.}   \n" +
                    " => \n" +
                    "{?P     :applyToIndication  ?indication_m; \n" +
                    "        :maxACRScore ?score_m;  \n" +
                    "        :withComments ?comments_m.}. \n" +
                    "{?P     :applyToIndication  ?indication_m; \n" +
                    "        :maxACRScore ?score_m.    }   \n" +
                    " => \n" +
                    "{?P     :applyToIndication  ?indication_m; \n" +
                    "        :maxACRScore ?score_m.}. \n" +
                    "{?P        :hasSCLWarning ?SCL.} \n" +
					"	=> \n" +
					"{?P        :hasSCLWarning ?SCL}.\n"	+
					"{?P        :hasPregnancyWarning \"true\".} \n" +
					"	=> \n" +
					"{?P        :hasPregnancyWarning \"true\"}."	
 

  	pquery = "http://localhost/.context" + encodeURIComponent(" " + pquery);				
  	//policies = "http://localhost/.context" + encodeURIComponent(" " + policies);
  	
  	processRDF("http://localhost/ACRValidation?selections="+encodeURIComponent(selection)+"&policy="+encodeURIComponent(policies)+"&query="+encodeURIComponent(pquery)+"&patientID="+patientId, function(rdfXml) {	         
        try {
       		var parser = getRDFParser(rdfXml);
       		var acrcomment = getObjects(parser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#withComments");
       		var score = getObjects(parser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#maxACRScore");
       		var sclWarning = getObjects(parser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#hasSCLWarning");       		
       		var pWarning = getObjects(parser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#hasPregnancyWarning");

       		var resultScore="";
       		
       		
       		var trElement = tdElement.get(0).parentNode;
       		var trElementId = trElement.id;
       		var remarkHidden = $("#" + trElementId + "remarkHidden");
 
            var sWarning = "\n";       		
       		if (sclWarning.length > 0)
       		{
      			var resultSCL = sclWarning[0];
      			alert ("Contrast Agent Alert! Patient SCL = " + resultSCL)
      			sWarning += "\nContrast Agent Alert! Patient SCL = " + resultSCL;          		
       		}
       		
       		if (pWarning.length > 0)
       		{
      			alert ("Pregnancy Alert! Patient is pregnant")
      			sWarning += "\n\nPregnancy Alert! Patient is pregnant\n";          		
       		}
       		
       		if (acrcomment.length >0)
       		   if (acrcomment[0].match("var#_") == null)
       		      remarkHidden.val(acrcomment[0] + sWarning);
       		   else
       		      remarkHidden.val(sWarning);
       		else
       		    remarkHidden.val(sWarning);
       		
       		//remarkHidden comment
       		if(score.length > 0) resultScore = score[0];
       		else resultScore = 0;
       		
       		//make the color change with the following range:
			// acrScore 1-3, red
			// acrScore 4-6, yellow
			// acrScore 7-10, green
			// if there is no score assigned, send alert sign
			
			if(resultScore ==0){
				var aHrefElement = $(tdElement.get(0).childNodes[0]);
				aHrefElement.empty();
				aHrefElement.append("<font color='red'> no score </font>");
			}
			else if(resultScore >= 1 && resultScore <= 3){
				//$("#AppropriatenessID").append("<input type='text' size='2' id='appropriatenessValue' readonly><img src='img/warn.png' align='bottom' alt='warn'>")
				var aHrefElement = $(tdElement.get(0).childNodes[0]);
				aHrefElement.empty();
				aHrefElement.append("<font color='red'>" + resultScore + "</font>");
			}
			else if(resultScore >= 4 && resultScore <= 6){
				var aHrefElement = $(tdElement.get(0).childNodes[0]);
				aHrefElement.empty();
				aHrefElement.append("<font color='#CC9900'>" + resultScore + "</font>");
			}
			else{
				var aHrefElement = $(tdElement.get(0).childNodes[0]);
				aHrefElement.empty();
				aHrefElement.append("<font color='green'>" + resultScore + "</font>");
			}
	   }
       catch (e)
       {
       		alert ("ACR appropriateness rating is not available");
       		alert(e);
       }
       $.unblockUI();
  	}); 
  	  
}


// calculate CDTI number for radiation dosage monitoring
function getAverageCTDI(bodyParts,patientID, trId)
{
	//get CTDI by body parts
	var pquery = 	"@prefix : <http://localhost/RPGDemo/tripleStore/patients#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    				"{?A 	:anonymized_patient_id :"+ patientID +";\n" +
    				"        :body_partID  :"+bodyParts +"; \n"+
    				"		:sum_ctdi ?C.}\n" +
 			       	"=> \n" +
 			       	"{?A 	:sum_ctdi   ?C}."
 			       	
  	//alert(pquery);
  	pquery = "http://localhost/.context" + encodeURIComponent(" " + pquery);				
  	processRDF("http://localhost/patientDosage?query="+encodeURIComponent(pquery), function(rdfXml) {
  		var parser = getRDFParser(rdfXml);
	  	var CTDI = getObjects(parser,"http://localhost/RPGDemo/tripleStore/patients#sum_ctdi");
	  	var sumCTDI = 0;
	  	if (CTDI.length > 0) sumCTDI = CTDI[0];
	  	else alert ("no CTDI found for the patient");
	  	
	  	
  	}); 
}

function loadProcedures() {
	
	var pquery = 	"@prefix : <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n"+
    				"@prefix owl: <http://www.w3.org/2002/07/owl#> .\n" +
    				"@prefix radlex: <http://bioontology.org/projects/ontologies/radlex/radlexOwlDlComponent#> .\n"+
    				"@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n" +
    				"@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
    				"@prefix ACR2007: <http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#> .\n" +
    				"{?A 	:procedureType ?PType;\n" +
    				"       :bodyPart   ?radName; \n" +
 			       	"     	:applyToAnatomicLocation    ?B; \n" +
					"       :hasCPTCode ?Code; \n" +
					"		rdfs:label ?S}  => \n" +
 			       	"{?A 	:procID   ?A; \n" +
 			       	"		:bodyPart   ?radName; \n" +
 			       	"     	:applyToAnatomicLocation    ?B; \n" +
					"       :procedureType ?PType;\n" +
					"       :hasCPTCode ?Code; \n" +
					"		rdfs:label ?S}.\n " 

	//using acr db
	//var pquery = "WHERE predicate==':procedureType' OR predicate==':bodyPart' OR predicate==':applyToAnatomicLocation' OR predicate==':hasCPTCode' OR predicate=='rdfs:label';  "					
  	//var pquery = "WHERE+predicate%3D%3D%27%3AprocedureType%27+OR+predicate%3D%3D%27%3AbodyPart%27+OR+predicate%3D%3D%27%3AapplyToAnatomicLocation%27+OR+predicate%3D%3D%27%3AhasCPTCode%27+OR+predicate%3D%3D%27rdfs%3Alabel%27%3B"
//  	alert(encodeURIComponent(pquery));
  	
  	pquery = "http://localhost/.context" + encodeURIComponent(" " + pquery); 
  	//pquery = encodeURIComponent(pquery);				
  	//alert(pquery);
  	
  	
//  	processRDF("http://localhost/acrListTest?", function(rdfXml) {

  
   	processRDF("http://localhost/ProcListDB?query="+encodeURIComponent(pquery), function(rdfXml) {

  		procedureParser = getRDFParser(rdfXml);
	  	var tempGlobalProcID = getSubjectObjects(procedureParser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#procID");
	  	globalProcID = getProcedureList(tempGlobalProcID);
	  	//globalProcID = getSubjects(procedureParser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#bodyPart");
	  	globalProcID.sort();
	  	//alert ("globalProcID #" + globalProcID.length + "first element: "+globalProcID[0]);
	  	var tempGlobalProcTypes = getSubjectObjects(procedureParser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#procedureType");
	  	globalProcTypes = getResults(tempGlobalProcTypes);
	  	var tempGlobalProcBodyParts = getSubjectObjects(procedureParser, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#bodyPart");
	  	globalProcBodyParts = getResults(tempGlobalProcBodyParts);
	  	//alert ("globalProcBodyParts #" + globalProcBodyParts.length + "first element: "+globalProcBodyParts[0]);
	  	tempProcTypes = getSubjectObjects(procedureParser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#procedureType");
	  	tempProcTypes = getResults(tempProcTypes);
	  	tempProcTypesForTreeView = getSubjectObjects(procedureParser,"http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#procedureType");
	  	tempProcTypesForTreeView = getResults(tempProcTypesForTreeView);
	  	tempProcBodyParts = getSubjectObjects(procedureParser, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#bodyPart");
	  	tempProcBodyParts = getResults(tempProcBodyParts);
	  	var tempGlobalProcNames = getSubjectObjects(procedureParser, "http://www.w3.org/2000/01/rdf-schema#label");
	  	globalProcNames = getResults(tempGlobalProcNames);
		//alert ("globalProcNames #" + globalProcNames.length + "first element: "+globalProcNames[0]);
	  	
		tempGlobalProcCPTs = getSubjectObjects(procedureParser, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#hasCPTCode");
		globalProcCPTs = getResults(tempGlobalProcCPTs);
		//alert ("globalProcCPTs #" + globalProcCPTs.length + "first element: "+globalProcCPTs[0]);
	  	
	    tempGlobalProcRadIDs = getSubjectObjects(procedureParser, "http://wopeg.he.agfa.be/RPGDemo/tripleStore/ACR2007#applyToAnatomicLocation");
	    globalProcRadIDs = getResults(tempGlobalProcRadIDs);
	    //alert ("globalProcRadIDs #" + globalProcRadIDs.length + "first element: "+globalProcRadIDs[0]);
	    $.unblockUI();
	    procedureTreeView();
	    
  	});
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


function getAllTreeView(container, rootNodeName, rootNodeID){
	$(container).append(getRootNode(rootNodeName, rootNodeID));
	$(container).Treeview({speed: "fast",
		toggle: function() {
			if(this.style.display=="block"){
				appendTree($("#"+this.id));
			}
		}
	});
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
	
  	processRDF("http://localhost/acrListByBodyPart?", function(rdfXml) {	       
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
					$("#procedureListBody").append("<tr id = '" + procId + "'  class='codelist'><td class='showStyle'>CPT-" + code + "</td><td class='showStyle'>" + desp + "</td><td class='showStyle'><a href='javascript:showDetails(\"" + procId + "\")'>" + acr + "</a></td><td class='showStyle'><a href='javascript:showCTDIDetails(\"" + procId + "\")'>details</a></td><td class='showStyle' title='edit'><a href=\"javascript:selectProcedureById('" + procId + "');\"><img alt='edit' border='0' src='img/editicon.png' width='19' height='19'/></a></td><td class='showStyle' title='delete'><a href=\"javascript:deleteById('" + procId + "');\"><img alt='delete' border='0' src='img/DeleteIcon.png' width='19' height='19'/></a></td></tr>");

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
				//$("#procedureListBody").append("<tr id = '" + time + "'  class='codelist'><td class='showStyle'>" + code + "</td><td class='showStyle'>" + desp + "</td><td class='showStyle'>" + acr + "</td><td class='showStyle'><a href='javascript:showDetails(\"" + time + "\")'>details</a></td><td class='showStyle'>" + accu + "</td><td class='showStyle'><a href='javascript:showCTDIDetails(\"" + time + "\")'>details</a></td><td class='showStyle'><a href=\"javascript:deleteById('" + time + "');\"><img alt='delete' border='0' src='img/DeleteIcon.png' width='19' height='19'/></a></td></tr>");
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

					$("#procedureListBody").append("<tr id = '" + procId + "'  class='codelist'><td class='showStyle'>CPT-" + code + "</td><td class='showStyle'>" + desp + "</td><td class='showStyle'><a href='javascript:showDetails(\"" + procId + "\")'>" + acr + "</a></td><td class='showStyle'><a href='javascript:showCTDIDetails(\"" + procId + "\")'>details</a></td><td class='showStyle' title='edit'><a href=\"javascript:selectProcedureById('" + procId + "');\"><img alt='edit' border='0' src='img/editicon.png' width='19' height='19'/></a></td><td class='showStyle' title='delete'><a href=\"javascript:deleteById('" + procId + "');\"><img alt='delete' border='0' src='img/DeleteIcon.png' width='19' height='19'/></a></td></tr>");

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
		var select = $(".codehovered");
		if(select.length!=0){
			var trElement = select.get(0);
			if(selectAnatomyId == "&nbsp;" && selectAnatomy == "&nbsp;"){
				trElement.childNodes[0].firstChild.nodeValue=" ";
			}
			else{
				trElement.childNodes[0].firstChild.nodeValue=selectAnatomyId + "-" + selectAnatomy;
			}
			if(selectPathology == "&nbsp;"){
				trElement.childNodes[1].firstChild.nodeValue=" ";
			}
			else{
				trElement.childNodes[1].firstChild.nodeValue=selectPathology;
				trElement.childNodes[1].id=selectPathologyId;
			}
			trElement.childNodes[2].firstChild.href="javascript:selectById('" + selectPathologyId + "-" +time + "')";;
			trElement.childNodes[3].firstChild.href="javascript:deleteById('" + selectPathologyId + "-" +time + "')";;
			trElement.id=selectPathologyId+"-"+time;
		}
		else{
			//alert ("selectPathologyId: "+selectPathologyId);
			$("#TINDICATION tbody").append("<tr id='" + selectPathologyId+"-"+time + "' class='codelist'><td class='showStyle'>" + selectAnatomyId + "-" + selectAnatomy + "</td><td class='showStyle'>" + selectPathology + "</td><td class='showStyle'><a href=\"javascript:selectById('" + selectPathologyId+"-"+time + "');\"><img alt='edit' border='0' src='img/editicon.png' width='19' height='19'/></a></td><td class='showStyle'><a href=\"javascript:deleteById('" + selectPathologyId+"-"+time + "');\"><img alt='delete' border='0' src='img/DeleteIcon.png' width='19' height='19'/></a></td></tr>");
		}
	
}

function selectDemographicCriteria(container, category, value) 
{
  //alert (" adding criteria: " + container +"," + category + ",  " + value);   
  
  var tag = (inclusionFlag)?"in":"ex";
  
  var entry = "<tr id = '" + category + tag + "'  class='codelist'>" +
              "<td class='showStyle'>" + category + "</td>" +
              " <td class='showStyle'>" + value + "</td>" +
              " <td class='showStyle' title='delete'><a href=\"javascript:deleteById('" + category + "');\"><img alt='delete' border='0' src='img/DeleteIcon.png' width='19' height='19'/></a></td> " + 
              " </tr>";
   alert (entry);            
  $(container).append(entry);
  
}

/* Bootstrap */
$(function() {
	$("#ADDIN").click(function() {			
		toggleDetailContainer("#DRUG");
		toggleSectionContainer("#INCLUSIONGRP");
		
		inclusionFlag = true;
		exclusionFlag = false;
		
		$("#BROSWER").empty();
		$("#pathology").empty();
		/* load drug ontology and populate the treeview */
		ontologyTreeView("#BROSWER");
		$("#drugName").val("");
	});
	
	$("#ADDEX").click(function() {			
		toggleDetailContainer("#DRUG");
		toggleSectionContainer("#EXCLUSIONGRP");
		
		inclusionFlag = false;
		exclusionFlag = true;
		
		$("#BROSWER").empty();
		$("#pathology").empty();
		/* load radlex/galen anatomy ontology and populate the treeview */
		//ontologyTreeView("#BROSWER");
		//$("#anatomyName").val("");
	});
	
	$("#drugSearch").click(function(){
			var drugName = $("#drugName").get(0).value;
			alert ("searching for " + drugName);
			searchTree("#BROSWER", drugName);			
	});
	
	$("#CLEAR").click(function(){
		$(".selectColor").each(function(){
			$(this).removeClass("selectColor");
		});
		$(".selectColorForPathology").each(function(){
			$(this).removeClass("selectColorForPathology");
		});
	});
	
	$("#PSEARCHCRITERIA tbody td input[@type='checkbox']").click(function(){		
	
		if (inclusionFlag) {
				selectDemographicCriteria("#Inclusion", $(this).get(0).value, $(this).get(0).checked);
			} else {
				selectDemographicCriteria("#Exclusion", $(this).get(0).value, $(this).get(0).checked);
			}			
				
	});

     $("#PSEARCHCRITERIA tbody td input[@type='text']").click(function(){		
	
		if (inclusionFlag) {
				selectDemographicCriteria("#Inclusion", $(this).get(0).name, $(this).get(0).value);
			} else {
				selectDemographicCriteria("#Exclusion", $(this).get(0).name, $(this).get(0).value);
			}			
				
	});
	
	$("#QUERYEXEC").click(function(){
		window.open("patientList.html");	
	});
	$("#cancel").click(function(){
		$("#SELECTEDP").get(0).value="";
		$("#codeListBody").empty();
		$("#procedureListBody").empty();
		$("#TPOLICY tbody").empty();
		$("#indicationINPUT").val("");
		toggleDetailContainer("#DEFAULTCONT");
	});
	$("#DisplayAllDrug").click(function(){
		$("#BROSWER").empty();
		$("#PROPERTY").empty();
		$("#drugName").val("");
		//getAlltologyTreeView("#BROSWER");
		getAllTreeView("#BROSWER", "IngredientDrug", "IngredientDrug");
	})
	
	$("#RESET").click(function(){
		toggleDetailContainer("#DEFAULTCONT");
		
		
		//$("#DRUG").empty();
		//$("#pathology").empty();
		//$("#anatomyName").val("");
		//getAlltologyTreeView("#BROSWER");
		//getAllTreeView("#INCLUSION", "anatomic location", "RID3");
	})
	
	toggleDetailContainer("#DEFAULTCONT");
//	inclusionFlag = false;
//	exclusionFlag = false;
		
		
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

