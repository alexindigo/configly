var testName = 'malformed';
var tap      = require('tap');
var path     = require('path');
var config   = require('../');

tap.throws(function()
{
  config(path.join(__dirname, 'fixtures/config/' + testName));
},
{message: 'default.json cannot be read or malformed'},
'expects to throw on malformed config file');
