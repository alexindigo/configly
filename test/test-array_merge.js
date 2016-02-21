var testName = 'array_merge';
var tap      = require('tap');
var path     = require('path');
var config   = require('../');
var expected = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);
var configObj;

// override arrayMerge function
// concat array instead of replacing
config._arrayMerge = function(a, b)
{
  return a.concat(b);
};

configObj = config(configDir);
tap.same(configObj, expected, 'expects to get config object with merged arrays');
