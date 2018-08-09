var testName  = 'cache';
var sinon     = require('sinon');
var test      = require('tape');
var path      = require('path');
var fs        = require('fs');
var config    = require('../');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('cache', function(t)
{
  t.plan(4);

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

  configObj = config({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get proper config object');
  t.equal(fs.readFileSync.callCount, 4, 'expects to read each file once');

  // oops, I did it again

  configObj = config({ directories: configDir });
  t.deepEqual(configObj, expected, 'expects to get proper config object, again');
  t.equal(fs.readFileSync.callCount, 4, 'expects to read each file only once, still');

  fs.readFileSync.restore();
});
