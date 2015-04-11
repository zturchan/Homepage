var curNode = 0;
var newPaths = 0;
var nodes = [];
var plusClicked = 0;
var plusClickedElement;
$(document).ready(function () {
	//Start with an empty node in storage
	appendNode(0,"Untitled Node", "", [], []);
	drawNodes();
	
	$("#add-path").click(function(){
		if ($("#path-name").val() != ""){
			$("#new-paths").append("<div class='btn-group' data-target='" + (nodes.length) +"'>" +
										"<button type='button' class='btn btn-default link-target'>" + (nodes.length) + "</button>" +
										"<button type='button' class='btn btn-default path-name'>" + $("#path-name").val() + "</button>" +
										"<button type='button' class='btn btn-default' onclick='removePath(this)'><span class='glyphicon glyphicon-remove'></span></button>" +
									"</div>");
			newPaths++;
			//Add a new empty node for this link
			appendNode(nodes.length,"Untitled Node", "", [], []);
			//Add a new entry to list of nodes
			// $("#nodes-list").append("<tr><td class='centered'>" + nodes.length + "</td><td>" + node.title + "</td><td class='centered'><span class = 'glyphicon glyphicon-plus'></span></td></tr>");
			drawNodes();
			
		}
		$("#path-name").val("");
	});
	
	$("#done").click(function() {
		//Add a new entry to list of nodes
		// $("#nodes-list").append("<tr><td class='centered'>" + curNode + "</td><td>" + $("#title-input").val() + "</td><td class='centered'><span class = 'glyphicon glyphicon-plus'></span></td></tr>");
		
		//Add the node to storage (overwrite current node if it exists)
		var paths = $("#new-paths").children();
		//targets are the ids of the nodes that a link links to
		//labels are the text that a reader will click to access the nodes
		var targets = [];
		var labels = [];
		for (var i = 0; i < paths.length; i++){
			targets[i] = $(paths[i]).attr("data-target");
			labels[i] = $(paths[i]).find(".path-name").html();
		}
		appendNode(curNode, $("#title-input").val(), $("#body-input").val(), targets, labels);
		
		drawNodes();
		
		//Do some cleanup/state maintaining
		clear();
		curNode = nodes.length;
		newPaths = 1;
		$("#curNode").html(curNode);
	});
	
	$("#create-new").click(function() {
		clear();
		nodes = [];
		appendNode(0,"Untitled Node", "", [], []);
		curNode = 0;
		drawNodes();
		$("#curNode").html("0");
	});
	
	//Save all story nodes as 0.html, 1.html, etc in the user's local directory
	//Also a file that will let us load it back into memory at some point for further editing
	$("#export").click(function(){
	//--allow-file-access-from-files If running locally need this flag for chrome
	//On Windows, close Chrome completely (Wrench-->Exit).
	// Right click on your Chrome shortcut and select Properties.
	// Add to the end of the Target field --allow-file-access-from-files so it would end with something like this -
	// chrome.exe" --allow-file-access-from-files
	// Click on OK and start Chrome.
			
		//Need to allow chrome to download multiple files automatically.
		var blob = new Blob([makeCSS()], {type: "text/plain;charset=utf-8"});
		//Need a local copy of our styles so the pages look good
		saveAs(blob, "style.css");
		//Save all the pages
		for (var page = 0; page < nodes.length; page++){
			blob = new Blob([makePageFile(page)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, page + ".html");
		}
		//Save a JSON of the story itself
		var story = JSON.stringify(nodes);
		blob = new Blob([story], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "story.json");
	});
	
	this.plusPopover = function(element){
		var popoverHtml = "<div class='input-group'><input type='text' class='form-control' id='existing-label-name' placeholder='Link Label'>" +
						"<div class='input-group-btn'>" + 
						"<button class='btn btn-primary' type='button' id='add-exist-link' tabindex='-1' onclick='addExistingLink(plusClicked)' >Add Link</button>" + 
						"</div>" +					
					"</div>";
		$(element).popover({placement: 'top', content: popoverHtml, html: true});
		$(element).popover("show");
		plusClicked = parseInt($(element.parentElement.parentElement.children[0]).html());
		plusClickedElement = element;
	}
});

function removePath(path) {
	$(path).closest("div").remove();
}

function clear(){
	$("#path-name").val("");
	$("#body-input").val("")
	$("#title-input").val("")
	$("#new-paths").children().remove();
}

function formatStrings (strings) {
	strings.sort(alphabetical);
	for (var i = 0; i < strings.length; i++) {
		var major = /\d+/.exec(strings[i])[0];
		var minor = /[.]\d+/.exec(strings[i])[0];
		minor = wholify(minor);
		strings[i] = "<a class='map-link' href='#' data-major='" + major + "' data-minor='" + minor + "' onclick='editNode(this)'>" + makeDashes(major) + strings[i] + "</a><br/>";
	}
	return strings;
}

function drawNodes(){
	$("#nodes-list").children().remove();
	for (var i = 0; i < nodes.length; i++){
		$("#nodes-list").append("<tr><td class='centered'>" + i + "</td><td class='link-title' onclick='editNode(this)'>" + nodes[i].title + "</td><td class='centered'><span class = 'glyphicon glyphicon-plus' rel='popover' onclick='document.plusPopover(this)'></span></td></tr>");
	}
	
	//Need to rebind the popover for all our elements after we redraw them.
	document.plusPopover = function(element){
	var popoverHtml = "<div class='input-group'><input type='text' class='form-control' id='existing-label-name' placeholder='Link Label'>" +
					"<div class='input-group-btn'>" + 
					"<button class='btn btn-primary' type='button' id='add-exist-link' tabindex='-1' onclick='addExistingLink(plusClicked)' >Add Link</button>" + 
					"</div>" +					
				"</div>";
	$(element).popover({placement: 'top', content: popoverHtml, html: true});
	$(element).popover("show");
	plusClicked = parseInt($(element.parentElement.parentElement.children[0]).html());
	plusClickedElement = element;
	}
}

function appendNode(id, title, body, targets, labels) {
	var node = new Object();
	node.id = id;
	if (title.trim() != "") {node.title = title;} else {node.title = "Untitled Node"};
	node.body = body;
	node.labels = labels;
	node.targets = targets;
	nodes[id] = node;
}

function editNode(element){
	//Save changes 
	var paths = $("#new-paths").children();
		//targets are the ids of the nodes that a link links to
		//labels are the text that a reader will click to access the nodes
		var targets = [];
		var labels = [];
		for (var i = 0; i < paths.length; i++){
			targets[i] = $(paths[i]).attr("data-target");
			labels[i] = $(paths[i]).find(".path-name").html();
		}
		appendNode(curNode, $("#title-input").val(), $("#body-input").val(), targets, labels);
	clear();
	drawNodes();
	//Load data
	curNode = $($(element.parentElement).find("td")[0]).html();
	$("#curNode").html(curNode);
	$("#body-input").val(nodes[curNode].body);
	$("#title-input").val(nodes[curNode].title);
	for (var i = 0; i < nodes[curNode].targets.length; i++) {
		$("#new-paths").append("<div class='btn-group' data-target='" + nodes[curNode].targets[i] +"'>" +
						"<button type='button' class='btn btn-default link-target'>" + nodes[curNode].targets[i] + "</button>" +
						"<button type='button' class='btn btn-default path-name'>" + nodes[curNode].labels[i] + "</button>" +
						"<button type='button' class='btn btn-default' onclick='removePath(this)'><span class='glyphicon glyphicon-remove'></span></button>" +
						"</div>");
	}
	newPaths = nodes[curNode].targets.length;
}

//id is the node to which we will link from the current node
function addExistingLink(id){
	$("#new-paths").append("<div class='btn-group' data-target='" + id +"'>" +
								"<button type='button' class='btn btn-default link-target'>" + id + "</button>" +
								"<button type='button' class='btn btn-default path-name'>" + $("#existing-label-name").val() + "</button>" +
								"<button type='button' class='btn btn-default' onclick='removePath(this)'><span class='glyphicon glyphicon-remove'></span></button>" +
							"</div>");
	newPaths++;
	nodes[curNode].targets[nodes[curNode].targets.length] = id;
	nodes[curNode].labels[nodes[curNode].labels.length] = $("#existing-label-name").val();
	$("#existing-label-name").val("");
	$(plusClickedElement).popover("hide");
}

function makePageFile(i) {
	var page = "<!DOCTYPE html><html lang='en'><head><title>" + 
    nodes[i].title + 
	"</title><link href='http://netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css' rel='stylesheet'><link href='style.css' rel='stylesheet'></head>" +
	"<div class='navbar navbar-inverse navbar-fixed-top' role='navigation'><div class='container'><div class='navbar-header'>" +
    "<a class='navbar-brand' href='#'>Made By Adventure Maker</a></div></div></div>" + 
	"<div class='container module'>" +
	"<div id='header-container'><span class='header-prompt'>" +
	nodes[i].title +  
	"</span></div><br><div class='page-body'>" + 
	nodes[i].body + "</div><br /><div class='page-links'>"; 
	
	for (var j = 0; j < nodes[i].targets.length; j++) {
		page += "<div class='btn-group' data-target='" + nodes[i].targets[j] +"'>" +
				"<a href='" + nodes[i].targets[j] + ".html'><button type='button' class='btn btn-default path-name' >" + nodes[i].labels[j] + "</button></a></div>";
	}
	page += "</div><script src='http://netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js'></script></body></html>"
	return page;
}

function makeCSS() {
	var css = "body {  padding-top: 50px;  background-color: black;  font-size:14px;  padding-bottom: 50px;}" +
	".module {	background-color: white;	padding-bottom: 25px;	padding-top: 25px;}" +
	".container{	max-width: 730px;}" +
	"#header-map{	font-size: 20px;	text-align: center;}" +
	".header-prompt{	font-size: 20px;	text-align: center;}" +
	"#title-input{	width: 100%;}" +
	"#body-input{	width: 100%;	max-width: 100%;	height: 200px;}" +
	"#done{	display: inline; 	margin-left: 25%;	width: 50%}" +
	"#story-body{	display:none;}" +
	"#header-container {	text-align: center;}" +
	".glyphicon-plus {	color: green;	cursor:pointer;}" +
	"th {	min-width: 80px;}" +
	".centered {	text-align: center;}" +
	"a {padding-right: 10px}" +
	".link-title {	color: blue;	text-decoration: underline;	cursor:pointer;}";
	return css;
}

