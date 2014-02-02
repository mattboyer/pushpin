var api_module = require('./pinboard_API');

exports['test main'] = function(assert) {
  assert.pass('Unit test running!');
};

exports['test main async'] = function(assert, done) {
  assert.pass('async Unit test running!');
  done();
};


exports['test url'] = function(assert) {
    assert.equal(api_module.prepare_URL('posts/update', {url: 'http://www.ticalc.org'}), 'https://api.pinboard.in/v1/posts/update?url=http://www.ticalc.org&auth_token=mboyer:cdcaba2a146d12ad7a1c&format=json', 'foo');
};

require('sdk/test').run(exports);
