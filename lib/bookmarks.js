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

exports['bookmark_page'] = bookmark_page;
exports['bookmark_image'] = bookmark_image;
exports['bookmark_link'] = bookmark_link;


var tabs_module = require('sdk/tabs');

var pinboard_API = require('pinboard_API');

function bookmark_page() {
    var url = tabs_module.activeTab.url;
    var title = tabs_module.activeTab.title;
    if (title.length > 255)
        title = title.substr(0, 255);
    pinboard_API.add_bookmark({
        url: url,
        description: title,
        extended: 'foo'
    });
}

function bookmark_image(img_attributes) {
    // Extra processing for the description/extended text go here
    if (img_attributes.alt == undefined || img_attributes.alt == '')
        img_attributes.alt = img_attributes.src;

    extended = String();
    if (img_attributes.title != undefined && img_attributes.title != '')
        extended = img_attributes.title;
    else
        extended = 'Image bookmarked from ' + img_attributes.baseURI;

    // Let's map the attributes of the JSON parameter object to API arguments
    pinboard_API.add_bookmark({
        url: img_attributes.src,
        description: img_attributes.alt,
        extended: extended
    });
}

function bookmark_link(a_attributes) {

    // Extra processing for the description/extended text go here
    var where_from = String('Bookmarked as link from ');
    where_from += a_attributes.baseURI;

    if (a_attributes.textContent == '') {
        if (a_attributes.title != '')
            a_attributes.textContent = a_attributes.title;
        else
            a_attributes.textContent = where_from;
    }

    // Let's map the attributes of the JSON parameter object to API arguments
    pinboard_API.add_bookmark({
        url: a_attributes.href,
        description: a_attributes.textContent,
        extended: where_from
    });
}

/* vim:set tabstop=4 softtabstop=4 shiftwidth=4 expandtab list: */
