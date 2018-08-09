var testName  = 'basic';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('basic', function(t)
{
  t.plan(1);

  var configObj;

  // augment `process.env` for stable testing`
  process.env['NODE_ENV']    = 'staging';
  process.env['EMPTY_VAR']   = '';
  process.env['TESTLINEONE'] = 'ABC';
  process.env['TESTLINETWO'] = 'XYZ';
  process.env['JUST_VAR']    = 'A VAR';
  process.env['VARPART1']    = 'COMBINED VAR 1/2';
  process.env['VARPART2']    = 'COMBINED VAR 2/2';

  configObj = config({ directories: configDir });
  t.deepLooseEqual(configObj, expected, 'expects to get proper config object');
});
