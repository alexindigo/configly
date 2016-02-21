var testName  = 'no_cache';
var sinon     = require('sinon');
var tap       = require('tap');
var path      = require('path');
var fs        = require('fs');
var config    = require('../');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);
var configObj;

// augment `process.env` for stable testing`
process.env['NODE_ENV']    = 'staging';
process.env['EMPTY_VAR']   = '';
process.env['TESTLINEONE'] = 'ABC';
process.env['TESTLINETWO'] = 'XYZ';
process.env['JUST_VAR']    = 'A VAR';
process.env['VARPART1']    = 'COMBINED VAR 1/2';
process.env['VARPART2']    = 'COMBINED VAR 2/2';

sinon.spy(fs, 'readFileSync');

// directly load files without caching
configObj = config.load(configDir);
tap.same(configObj, expected, 'expects to get proper config object');
tap.equals(fs.readFileSync.callCount, 4, 'expects to read each file each time');

// oops, I did it again

configObj = config.load(configDir);
tap.same(configObj, expected, 'expects to get proper config object, again');
tap.equals(fs.readFileSync.callCount, 8, 'expects to read each file again');

// and it shouldn't be in the cache either

configObj = config(configDir);
tap.same(configObj, expected, 'expects to get proper config object, again');
tap.equals(fs.readFileSync.callCount, 12, 'expects to read each file once again');
