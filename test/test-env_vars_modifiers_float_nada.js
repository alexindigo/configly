var testName  = 'env_vars_modifiers_float_nada';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('not a float environment variable with float modifier', function(t)
{
  t.plan(1);

  // augment `process.env` for stable testing`
  process.env['ANTI_FLOAT'] = 'point five';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to parse provided value `point five` with `float` modifier. Exception: Invalid Float/,
  'expects to throw on bad float within float modifier of custom-environment-variables file');
});
