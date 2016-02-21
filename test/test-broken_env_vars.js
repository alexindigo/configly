var testName = 'broken_env_vars';
var tap      = require('tap');
var path     = require('path');
var config   = require('../');

// augment `process.env` for stable testing`
process.env['NODE_ENV']    = 'staging';
process.env['EMPTY_VAR']   = '';
process.env['TESTLINEONE'] = 'ABC';
process.env['TESTLINETWO'] = 'XYZ';
process.env['JUST_VAR']    = 'A VAR';
process.env['VARPART1']    = 'COMBINED VAR 1/2';
process.env['VARPART2']    = 'COMBINED VAR 2/2';

tap.throws(function()
{
  config(path.join(__dirname, 'fixtures/config/' + testName));
},
{message: 'Illegal key type for custom-environment-variables at Arrays Not Supported: [object Array]'},
'expects to throw on array element within custom-environment-variables file');
