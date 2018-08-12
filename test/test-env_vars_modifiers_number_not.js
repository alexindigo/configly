var testName  = 'env_vars_modifiers_number_not';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('not a number environment variable with number modifier', function(t)
{
  t.plan(1);

  // augment `process.env` for stable testing`
  process.env['ALMOST_NUMBER'] = 'One';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to parse provided value `One` with `number` modifier. Exception: Invalid Number/,
  'expects to throw on broken json within json modifier of custom-environment-variables file');
});
