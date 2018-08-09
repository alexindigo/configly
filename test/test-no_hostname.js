var testName  = 'no_hostname';
var sinon     = require('sinon');
var test      = require('tape');
var path      = require('path');
var os        = require('os');
var config    = require('../');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('no hostname', function(t)
{
  t.plan(2);

  var configObj, _host, _hostname;

  // make `process.env` not to contain hostname info
  _host     = process.env['HOST'];
  _hostname = process.env['HOSTNAME'];
  delete process.env['HOST'];
  delete process.env['HOSTNAME'];
  // make `os.hostname()` return nothing
  sinon.stub(os, 'hostname');
  os.hostname.returns(null);
  // reset list of files to search for
  config = config.new({files: null});
  t.deepEqual(config.files, ['default', '', '', '', 'local', 'custom-include-files', 'custom-environment-variables', 'runtime'], 'should be default list of files');

  configObj = config({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get proper config object without hostname');

  // restore hacks
  os.hostname.restore();
  process.env['HOST']     = _host;
  process.env['HOSTNAME'] = _hostname;
});
