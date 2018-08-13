var testName  = 'env_vars_modifiers_json_broken';
var test      = require('tape');
var path      = require('path');
var config    = require('../configure');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('broken json environment variable with json modifier', function(t)
{
  t.plan(1);

  // augment `process.env` for stable testing`
  process.env['SOMETHING_LIKE'] = 'If it doesn\'t look like json';

  t.throws(function()
  {
    config({ directories: configDir });
  },
  /Unable to parse provided value `If it doesn't look like json` with `json` modifier. Exception: Unexpected token I in JSON at position 0/,
  'expects to throw on broken json within json modifier of custom-environment-variables file');
});
