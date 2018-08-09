var testName  = 'immutable';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('immutable', function(t)
{
  t.plan(1);

  var configObjA, configObjB;

  configObjA = config({ directories: configDir });
  configObjB = config({ directories: configDir });

  // mutate
  configObjA.Customers.dbName = 'mutated';
  t.notDeepEqual(configObjA, configObjB, 'expects config objects to be different');
});
