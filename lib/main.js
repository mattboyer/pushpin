/*
Copyright (C) 2013 Matt Boyer.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. Neither the name of the project nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE PROJECT AND CONTRIBUTORS ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED.  IN NO EVENT SHALL THE PROJECT OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
SUCH DAMAGE.
*/

var base_URL = String("https://api.pinboard.in/v1/")

var widget_module = require("sdk/widget")
var notifications_module = require("sdk/notifications")
var request_module = require("sdk/request")
var tabs_module = require("sdk/tabs")
var context_module = require("sdk/context-menu")

var addon_data = require("sdk/self").data
var addon_prefs = require("sdk/simple-prefs").prefs

page_context_menu = context_module.PageContext();

page_bookmark_item = context_module.Item({
	label: "Bookmark page on Pinboard",
	image: addon_data.url("pushpin.svg"),
	context: context_module.PageContext(),
	contentScript: 'self.on("click", function(node) {self.postMessage();})',
	onMessage: function(){ bookmark_page() },
});

link_bookmark_item = context_module.Item({
	label: "Bookmark link on Pinboard",
	image: addon_data.url("pushpin.svg"),
	context: context_module.SelectorContext("a"),
	contentScript: 'self.on("click", function(node) {attrs = Object(); for (attr in node) attrs[attr] = node[attr]; self.postMessage(attrs);})',
	onMessage: function(a_json){  bookmark_link(a_json); },
});

image_bookmark_item = context_module.Item({
	label: "Bookmark image on Pinboard",
	image: addon_data.url("pushpin.svg"),
	context: context_module.SelectorContext("img"),
	contentScript: 'self.on("click", function(node) {attrs = Object(); for (attr in node) attrs[attr] = node[attr]; self.postMessage(attrs);})',
	onMessage: function(img_json){console.log(img_json);  bookmark_image(img_json); },
});


var pushpin_widget = widget_module.Widget({
	label: "Pushpin",
	id: "pushpin_widget",
	width: 32,
	contentURL: addon_data.url("pushpin.svg"),
	onClick: bookmark_page,
});

function prepare_URL(method, arguments) {

	arguments.auth_token = encodeURI(
		[
			addon_prefs.pinboard_username,
			addon_prefs.pinboard_API_key
		].join(":")
	);
	arguments.format = String("json");
	URL = String(base_URL);
	URL += method;
	URL += "?";

	argument_pairs = Array();
	for (arg_name in arguments)
		argument_pairs = argument_pairs.concat(
			String(arg_name + "=" + arguments[arg_name])
		);

	URL += argument_pairs.join("&");
	return URL;
}

function notify_user(text) {
	notifications_module.notify({
		title: "Pushpin",
		text: text,
		iconURL: addon_data.url("pushpin.svg")
	})
}

function process_response(response) {
	if (response.status != 200 || response.json.result_code != "done") {
		notify_user("Pushpin encountered a failure");
		return;
	}
	
	// Rate limitation stuff goes here
	notify_user("Bookmark added to Pinboard");
}

function add_bookmark(params) {

	for (param in params)
		if (params[param] != undefined)
			params[param] = encodeURI(params[param])

	pinboard_req = request_module.Request({
		url: prepare_URL("posts/add", params),
		onComplete: process_response,
	});
	pinboard_req.get();
}

function bookmark_page() {
	var url = tabs_module.activeTab.url;
	var title = tabs_module.activeTab.title;
	if (title.length > 255)
		title = title.substr(0, 255);
	add_bookmark({
		url: url,
		description: title,
		extended: "foo",
	});
}

function bookmark_image(img_attributes) {
	console.log("Image element " + JSON.stringify(img_attributes));
	console.log("Logging image "+img_attributes.src+" with title "+img_attributes.alt);
	// Extra processing for the description/extended text go here
	if (img_attributes.alt == undefined || img_attributes.alt == "")
		img_attributes.alt = img_attributes.src;

	extended = String();
	if (img_attributes.title != undefined && img_attributes.title != "")
		extended = img_attributes.title;
	else
		extended = "Image bookmarked from "+img_attributes.baseURI;

	// Let's map the attributes of the JSON parameter object to API arguments
	add_bookmark({
		url: img_attributes.src,
		description: img_attributes.alt,
		extended: extended,
	});
}

function bookmark_link(a_attributes) {
	console.log("Link element " + JSON.stringify(a_attributes));
	console.log("Logging link to "+a_attributes.href+" with title "+a_attributes.textContent);

	// Extra processing for the description/extended text go here
	var where_from = String("Bookmarked as link from ");
	where_from += a_attributes.baseURI;

	if (a_attributes.textContent == "") {
		if (a_attributes.title != "")
			a_attributes.textContent = a_attributes.title;
		else
			a_attributes.textContent = where_from;
	}

	// Let's map the attributes of the JSON parameter object to API arguments
	add_bookmark({
		url: a_attributes.href,
		description: a_attributes.textContent,
		extended: where_from,
	});
}

/* vim:set tabstop=4 softtabstop=4 shiftwidth=4 noexpandtab list: */
