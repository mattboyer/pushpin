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

exports['add_bookmark'] = add_bookmark;
exports['prepare_URL'] = prepare_URL;
exports['process_response'] = process_response;
exports['request_token'] = request_token;

var API_scheme = String('https://');
var API_host = String('api.pinboard.in');
var API_version = String('v1');


var request_module = require('sdk/request');
var addon_prefs = require('sdk/simple-prefs').prefs;

function base_URL(username, password) {
    if ((username != undefined) && (password != undefined))
        return (API_scheme + username + ':' + password + '@' + API_host +
                '/' + API_version + '/');
    else
        return API_scheme + API_host + '/' + API_version + '/';
}

function credentials_present() {
    return (addon_prefs.pinboard_username > '') &&
        (addon_prefs.pinboard_API_key > '');
}

function request_token(params) {
    // Save the username to the add-on's preferences
    addon_prefs.pinboard_username = params.username;
    pinboard_req = request_module.Request({
        url: base_URL(params.username, params.password) +
                'user/api_token?format=json',
        onComplete: function(response) {
            require('pushpin_UI').api_handler(
                token_response,
                response
            );
        }
    });
    pinboard_req.get();
}

function token_response(response) {
    if (response.status != 200)
        throw 'bad_credentials';

    addon_prefs.pinboard_API_key = response.json.result;
    throw 'token_success';
}

function prepare_URL(method, arguments) {

    arguments.auth_token = encodeURI(
        [
            addon_prefs.pinboard_username,
            addon_prefs.pinboard_API_key
        ].join(':')
    );
    arguments.format = String('json');
    URL = base_URL();
    URL += method;
    URL += '?';

    argument_pairs = Array();
    for (arg_name in arguments)
        argument_pairs = argument_pairs.concat(
            String(arg_name + '=' + arguments[arg_name])
        );

    URL += argument_pairs.join('&');
    return URL;
}

function process_response(response) {
    if (response.status != 200 || response.json.result_code != 'done')
        throw 'API_failure';

    // TODO Rate limitation stuff goes here

    throw 'API_success';
}

function add_bookmark(params) {

    if (!(credentials_present()))
        throw 'no_credentials';

    for (param in params)
        if (params[param] != undefined)
            params[param] = encodeURI(params[param]);

    pinboard_req = request_module.Request({
        url: prepare_URL('posts/add', params),
        onComplete: function(response) {
            require('pushpin_UI').api_handler(
                process_response,
                response
            );
        }
    });
    pinboard_req.get();
}

/* vim:set tabstop=4 softtabstop=4 shiftwidth=4 expandtab list: */
