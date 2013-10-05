function submit_token_request() {
    var username = document.getElementById('username');
    var password = document.getElementById('password');

    self.port.emit('request_token', {
        'username': username.value,
        'password': password.value
    });
}

window.addEventListener('load', function() {
    var form = document.getElementById('token_request');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        submit_token_request();
    });
});

/* vim:set tabstop=4 softtabstop=4 shiftwidth=4 expandtab list: */
