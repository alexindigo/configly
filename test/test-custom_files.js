var path   = require('path');
var test   = require('tape');
var config = require('../configure');

test('custom files', function(t)
{
  t.plan(4);

  var newConfig, configObj;

  // update default directories for the test
  newConfig = config.new({defaults: {directories: './test/fixtures/config/custom'}});

  // "default" with custom directory

  configObj = newConfig();
  t.deepEqual(configObj, {
    'fields': {
      'field_1': '1 from main/default.js',
      'field_2': '2 from main/default.json',
      'field_3': '3 from main/runtime.json',
      'field_4': '4 from main/runtime.json'
    }
  }, 'expects to get proper config object from the default directory');

  // with custom file "on-the-fly"

  configObj = newConfig({
    files: newConfig.files.concat(path.join(__dirname, 'fixtures/config/custom_2/custom'))
  });
  t.deepEqual(configObj, {
    'fields': {
      'field_1': '1 from main/default.js',
      'field_2': '2 from main/default.json',
      'field_3': '3 from main/runtime.json',
      'field_4': '4 from secondary/custom.json',
      'field_5': '5 from secondary/custom.json'
    }
  }, 'expects to get proper config object from the default directory + on-the-fly custom file');

  // with bake-in custom file

  newConfig = newConfig.new({
    files: newConfig.files.concat(path.join(__dirname, 'fixtures/config/custom_2/custom'))
  });

  configObj = newConfig();
  t.deepEqual(configObj, {
    'fields': {
      'field_1': '1 from main/default.js',
      'field_2': '2 from main/default.json',
      'field_3': '3 from main/runtime.json',
      'field_4': '4 from secondary/custom.json',
      'field_5': '5 from secondary/custom.json'
    }
  }, 'expects to get proper config object from the default directory + baked-in custom file');

  // with bake-in custom file and different search directory

  configObj = newConfig({
    directories: './test/fixtures/config/custom_3'
  });
  t.deepEqual(configObj, {
    'fields': {
      'field_4': '4 from secondary/custom.json',
      'field_5': '5 from secondary/custom.json',
      'field_6': '6 from primary/default.json'
    }
  }, 'expects to get proper config object from the custom directory + baked-in custom file');

});
