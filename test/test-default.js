var testName = 'default';
var test     = require('tape');
var config   = require('../');
var expected = require('./fixtures/expected/' + testName + '.json');

test('default', function(t)
{
  t.plan(2);

  var configObj;

  // update default directories for the test
  var newConfig = config.new({defaults: {directories: './test/fixtures/config/default'}});

  // augment `process.env` for stable testing`
  process.env['NODE_ENV']    = 'staging';
  process.env['EMPTY_VAR']   = '';
  process.env['TESTLINEONE'] = 'ABC';
  process.env['TESTLINETWO'] = 'XYZ';
  process.env['JUST_VAR']    = 'A VAR';
  process.env['VARPART1']    = 'COMBINED VAR 1/2';
  process.env['VARPART2']    = 'COMBINED VAR 2/2';

  configObj = newConfig();
  t.deepEqual(configObj, expected, 'expects to get proper config object from `configly`, with the default directories');

  // same works for `config.load` function
  configObj = newConfig.load();
  t.deepEqual(configObj, expected, 'expects to get same config object from `.load`, with the default directories');
});
