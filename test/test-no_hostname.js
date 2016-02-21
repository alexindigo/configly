var testName = 'no_hostname';
var sinon     = require('sinon');
var tap      = require('tap');
var path     = require('path');
var os       = require('os');
var expected = require('./fixtures/expected/' + testName + '.json');
var configObj;

// make os.hostname() return nothing
sinon.stub(os, 'hostname');
os.hostname.returns(null);
// now require configly and get faked hostname
var config = require('../');

configObj = config(path.join(__dirname, 'fixtures/config/' + testName));
tap.same(configObj, expected, 'expects to get proper config object');
