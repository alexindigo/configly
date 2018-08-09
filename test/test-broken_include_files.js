var testName  = 'broken_include_files';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('broken custom include files', function(t)
{
  t.plan(1);

  t.throws(function()
  {
    config({ directories: configDir });
  },
  {message: 'Illegal key type for custom-include-files at Arrays Not Supported: [object Array]'},
  'expects to throw on array element within custom-include-files file');
});
