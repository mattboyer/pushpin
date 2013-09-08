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

var widget_module = require('sdk/widget');
var notifications_module = require('sdk/notifications');
var context_module = require('sdk/context-menu');
var addon_data = require('sdk/self').data;

var bookmarks = require('bookmarks');

// Do we really want to call notify_user from other modules?
exports['notify_user'] = notify_user;

function notify_user(text) {
    notifications_module.notify({
        title: 'Pushpin',
        text: text,
        iconURL: addon_data.url('pushpin.svg')
    });
}

page_context_menu = context_module.PageContext();

page_bookmark_item = context_module.Item({
    label: 'Bookmark page on Pinboard',
    image: addon_data.url('pushpin.svg'),
    context: context_module.PageContext(),
    contentScript: 'self.on("click", function(node) {self.postMessage();})',
    onMessage: function() { bookmarks.bookmark_page() }
});

link_bookmark_item = context_module.Item({
    label: 'Bookmark link on Pinboard',
    image: addon_data.url('pushpin.svg'),
    context: context_module.SelectorContext('a'),
    contentScript: 'self.on("click", function(node) {attrs = Object(); for ' +
        '(attr in node) attrs[attr] = node[attr]; self.postMessage(attrs);})',
    onMessage: function(a_json) { bookmarks.bookmark_link(a_json); }
});

image_bookmark_item = context_module.Item({
    label: 'Bookmark image on Pinboard',
    image: addon_data.url('pushpin.svg'),
    context: context_module.SelectorContext('img'),
    contentScript: 'self.on("click", function(node) {attrs = Object(); for ' +
        '(attr in node) attrs[attr] = node[attr]; self.postMessage(attrs);})',
    onMessage: function(img_json) { bookmarks.bookmark_image(img_json); }
});

var pushpin_widget = widget_module.Widget({
    label: 'Pushpin',
    id: 'pushpin_widget',
    width: 32,
    contentURL: addon_data.url('pushpin.svg'),
    onClick: bookmarks.bookmark_page
});

/* vim:set tabstop=4 softtabstop=4 shiftwidth=4 expandtab list: */
