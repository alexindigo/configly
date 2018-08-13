var testName  = 'env_vars_modifiers_date_malformed';
var test      = require('tape');
var path      = require('path');
var config    = require('../configure');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('malformed date environment variable with date modifier', function(t)
{
  t.plan(1);

  // augment `process.env` for stable testing`
  process.env['SOMETIME_NEVER'] = 'If it doesn\'t look like date';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to parse provided value `If it doesn\'t look like date` with `date` modifier. Exception: Invalid Date/,
  'expects to throw on malformed date within date modifier of custom-environment-variables file');
});
