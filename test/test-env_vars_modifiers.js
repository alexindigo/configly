var testName  = 'env_vars_modifiers';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var expected  = require('./fixtures/expected/' + testName + '.js');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('custom environment variables with custom modifiers', function(t)
{
  t.plan(1);

  var configObj;

  // augment `process.env` for stable testing`
  process.env['SOME_STRING']   = 'Hello world';
  process.env['A_NUMBER']      = '345';
  process.env['JUST_NULL']     = 'null';
  process.env['VERY_TRUE']     = 'true';
  process.env['PRETTY_FALSE']  = 'false';
  process.env['BELOW_ZERO']    = '-67';
  process.env['FALSY_ZERO']    = '0';
  process.env['SOMETIME_THEN'] = 'Fri Aug 10 2018 10:01:56 GMT-0700';

  // make sure it's not set
  delete process.env['WITHOUT_ENV'];

  configObj = config({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get right config object');
});
