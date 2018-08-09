var testName  = 'include_files';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('custom include files', function(t)
{
  t.plan(1);

  var configObj = config({ directories: configDir });
  t.deepLooseEqual(configObj, expected, 'expects to get right config object');
});
