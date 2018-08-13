var testName  = 'env_vars_modifiers_array_less';
var test      = require('tape');
var path      = require('path');
var config    = require('../configure');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('environment variable without array with array modifier', function(t)
{
  t.plan(1);

  // valid object, but not an array
  process.env['ARRAY_LESS'] = '{"length": 25, "a": 134}';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to parse provided value `\{"length": 25, "a": 134\}` with `array` modifier. Exception: Invalid Array/,
  'expects to throw on broken array within array modifier of custom-environment-variables file');
});
