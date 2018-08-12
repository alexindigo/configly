var testName  = 'env_vars_modifiers_not_found';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('environment variable with non-existent modifier', function(t)
{
  t.plan(1);

  // augment `process.env` for stable testing`
  process.env['LEGIT_VALUE'] = '1337';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to find requested modifier `not-a-modifier` among available modifiers: \[date\], \[json\]\./,
  'expects to throw on non-existent modifier of custom-environment-variables file');
});
