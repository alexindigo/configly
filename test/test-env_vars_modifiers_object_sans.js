var testName  = 'env_vars_modifiers_object_sans';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('environment variable without object with object modifier', function(t)
{
  t.plan(1);

  // valid object, but not an array
  process.env['OBJECT_SANS'] = '[ "hello", "there", "null", 0 ]';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to parse provided value `\[ "hello", "there", "null", 0 \]` with `object` modifier. Exception: Invalid Object/,
  'expects to throw on not real pojo within object modifier of custom-environment-variables file');
});
