var testName  = 'malformed';
var tap       = require('tap');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

tap.throws(function()
{
  config(configDir);
},
{message: 'default.json cannot be read or malformed'},
'expects to throw on malformed config file');
