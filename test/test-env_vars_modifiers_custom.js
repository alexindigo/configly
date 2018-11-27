var testName  = 'env_vars_modifiers_custom';
var moment    = require('moment');
var test      = require('tape');
var path      = require('path');
var config    = require('../configure');
var expected  = require('./fixtures/expected/' + testName + '.js');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('enhanced environment variables with custom modifiers', function(t)
{
  t.plan(1);

  var configObj;

  // augment `process.env` for stable testing`
  process.env['SOMEWHERE_TIME'] = '2016-01-01T00:00:00';

  configObj = config({
    directories: configDir,
    modifiers: {
      datetimeUTC: function(input) {
        return moment.utc(input);
      }
    }
  });

  t.deepEqual(configObj, expected, 'expects to get right config object');
});
