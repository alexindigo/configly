var testName = 'array_merge';
var tap      = require('tap');
var path     = require('path');
var config   = require('../');
var expected = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);
var configObj;

// override arrayMerge function
// concat arrays instead of replacing
config._arrayMerge = function(to, from, merge)
{
  from.reduce(function(target, value)
  {
    target.push(merge(undefined, value));
    return target;
  }, to);

  return to;
};

configObj = config(configDir);
tap.same(configObj, expected, 'expects to get config object with merged arrays');
