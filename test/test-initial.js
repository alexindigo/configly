//var tap      = require('tap');
var path     = require('path');
var config   = require('../');
var expected = require('./fixtures/expected/initial.json');

var configObj = config(path.join(__dirname, 'fixtures/config/initial'));

//tap.same(configObj, expected);
