var testName  = 'env_vars_modifiers';
var test      = require('tape');
var path      = require('path');
var config    = require('../configure');
var expected  = require('./fixtures/expected/' + testName + '.js');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('treated environment variables with modifiers', function(t)
{
  t.plan(1);

  var configObj;

  // augment `process.env` for stable testing`

  // json
  process.env['SOME_STRING']   = 'Hello world';
  process.env['A_NUMBER']      = '345';
  process.env['JUST_NULL']     = 'null';
  process.env['VERY_TRUE']     = 'true';
  process.env['PRETTY_FALSE']  = 'false';
  process.env['BELOW_ZERO']    = '-67';
  process.env['FALSY_ZERO']    = '0';

  // date
  process.env['SOMETIME_THEN'] = 'Sat Aug 11 2018 10:01:56 GMT-0700';

  // number, int
  process.env['KINDOF_NUMBER'] = '15 minutes';

  // float
  process.env['HALF_A_NUMBER'] = '1.5 vcpus';

  // array
  process.env['ARRAY_BUNCH'] = '[25, "boom", null, false]';

  // object
  process.env['OBJECT_IT'] = '{"a": 1, "b": "two", "c": true}';

  // boolean, bool
  process.env['EITHER_OR_TRUE'] = 'true';
  process.env['EITHER_OR_FALSE'] = 'false';
  process.env['EITHER_OR_ZERO'] = '0';
  process.env['EITHER_OR_ONE'] = '1';

  process.env['SOME_PATTERN'] = 'something to match';
  process.env['OTHER_PATTERN'] = '/^[a-z0-9]+/i';
  process.env['ANOTHER_PATTERN'] = '/^[A-Z0-9]+/';

  // make sure it's not set
  delete process.env['WITHOUT_ENV'];

  configObj = config({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get right config object');
});
