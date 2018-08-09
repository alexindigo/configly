var test   = require('tape');
var config = require('../');

test('multi dirs', function(t)
{
  t.plan(4);

  var configObj;

  // get stuff from multiple directories on-the-fly
  configObj = config([
    './test/fixtures/config/custom',
    './test/fixtures/config/custom_2',
    './test/fixtures/config/custom_3'
  ]);

  t.deepEqual(configObj, {
    fields: {
      field_0: '0 from secondary/default.json',
      field_1: '1 from main/default.js',
      field_2: '2 from main/default.json',
      field_3: '3 from main/runtime.json',
      field_4: '4 from main/runtime.json',
      field_5: '5 from primary/default.json',
      field_6: '6 from primary/default.json',
      field_9: '9 from secondary/default.json'
    }
  }, 'expects to get proper config object from multiple directories on-the-fly setup');

  // update default directories for the test
  config = config.new({
    defaults: {
      directories: [
        './test/fixtures/config/custom',
        './test/fixtures/config/custom_2',
        './test/fixtures/config/custom_3'
      ]
    }
  });

  // "default" with custom directories
  configObj = config();
  t.deepEqual(configObj, {
    fields: {
      field_0: '0 from secondary/default.json',
      field_1: '1 from main/default.js',
      field_2: '2 from main/default.json',
      field_3: '3 from main/runtime.json',
      field_4: '4 from main/runtime.json',
      field_5: '5 from primary/default.json',
      field_6: '6 from primary/default.json',
      field_9: '9 from secondary/default.json'
    }
  }, 'expects to get proper config object from the multiple directories set as default');

  // "default" with custom directories and custom filename
  configObj = config({files: config.files.concat('custom')});
  t.deepEqual(configObj, {
    fields: {
      field_0: '0 from secondary/default.json',
      field_1: '1 from main/default.js',
      field_10: '10 from primary/custom.json',
      field_2: '2 from main/default.json',
      field_20: '20 from primary/custom.json',
      field_3: '3 from main/runtime.json',
      field_4: '4 from secondary/custom.json',
      field_5: '5 from secondary/custom.json',
      field_6: '6 from primary/default.json',
      field_9: '9 from secondary/default.json'
    }
  }, 'expects to get proper config object from the multiple directories and custom filename');

  // update once again to add custom filename
  config = config.new({files: config.files.concat('custom')});

  // "default" with custom directories and custom filename
  configObj = config();
  t.deepEqual(configObj, {
    fields: {
      field_0: '0 from secondary/default.json',
      field_1: '1 from main/default.js',
      field_10: '10 from primary/custom.json',
      field_2: '2 from main/default.json',
      field_20: '20 from primary/custom.json',
      field_3: '3 from main/runtime.json',
      field_4: '4 from secondary/custom.json',
      field_5: '5 from secondary/custom.json',
      field_6: '6 from primary/default.json',
      field_9: '9 from secondary/default.json'
    }
  }, 'expects to get proper config object from the multiple directories and custom filename baked into default');

});
