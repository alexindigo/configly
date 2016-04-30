var testName  = 'no_hostname';
var sinon     = require('sinon');
var test      = require('tape');
var path      = require('path');
var os        = require('os');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('no hostname', function(t)
{
  t.plan(1);

  var configObj;

  // make os.hostname() return nothing
  sinon.stub(os, 'hostname');
  os.hostname.returns(null);
  // now require configly and get faked hostname
  var config = require('../');

  configObj = config(configDir);
  t.deepEqual(configObj, expected, 'expects to get proper config object without hostname');
});
