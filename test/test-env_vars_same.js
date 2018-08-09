var testName  = 'env_vars_same';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('custom environment variables with value same as the key', function(t)
{
  t.plan(1);

  var configObj;

  // augment `process.env` for stable testing`
  process.env['VALUE'] = 'VALUE';
  process.env['VAL3']  = 'three';
  process.env['VAL4']  = 'four';

  configObj = config({ directories: configDir });
  t.deepLooseEqual(configObj, expected, 'expects to get right config object');
});
