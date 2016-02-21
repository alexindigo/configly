var testName = 'immutable';
var tap      = require('tap');
var path     = require('path');
var config   = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);
var configObjA, configObjB;

configObjA = config(configDir);
configObjB = config(configDir);

// mutate
configObjA.Customers.dbName = 'mutated';

tap.notSame(configObjA, configObjB, 'expects config objects to be different');
