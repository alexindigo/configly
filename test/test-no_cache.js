var testName  = 'no_cache';
var sinon     = require('sinon');
var test      = require('tape');
var path      = require('path');
var fs        = require('fs');
var config    = require('../configure');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('no cache', function(t)
{
  t.plan(6);

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

  // directly load files without checking for cache
  configObj = config.load({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get proper config object');
  t.equal(fs.readFileSync.callCount, 4, 'expects to read each file each time');

  // oops, I did it again

  // directly load files without checking for cache
  configObj = config.load({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get proper config object, again');
  t.equal(fs.readFileSync.callCount, 8, 'expects to read each file again');

  // and it should be in the cache already
  configObj = config({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get proper config object, again');
  t.equal(fs.readFileSync.callCount, 8, 'expects not to read files again');

  fs.readFileSync.restore();
});
