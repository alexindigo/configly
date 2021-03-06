var testName  = 'array_merge';
var test      = require('tape');
var path      = require('path');
var config    = require('../configure');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('array merge', function(t)
{
  t.plan(2);

  var configObj, defaultDir = '/bla';

  // create new instance with custom array merge function
  // concat arrays instead of replacing
  var customConfig = config.new({
    defaults: {
      directories: defaultDir
    },
    files: config.files.concat('my_custom_file'),
    arrayMerge: function(to, from, merge)
    {
      from.reduce(function(target, value)
      {
        target.push(merge(undefined, value));
        return target;
      }, to);

      return to;
    }
  });

  configObj = customConfig({ directories: configDir });

  t.equal(customConfig.defaults.directories, defaultDir, 'expects to have new default directories');
  t.deepLooseEqual(configObj, expected, 'expects to get config object with merged arrays');
});
