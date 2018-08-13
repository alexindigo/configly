var testName  = 'env_vars_modifiers_boolean_un';
var test      = require('tape');
var path      = require('path');
var config    = require('../configure');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('not a boolean environment variable with boolean modifier', function(t)
{
  t.plan(1);

  // valid object, but not an array
  process.env['UN_BOOLEAN'] = '2';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to parse provided value `2` with `boolean` modifier. Exception: Invalid Boolean/,
  'expects to throw on unboolean within boolean modifier of custom-environment-variables file');
});
