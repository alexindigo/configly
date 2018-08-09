var testName  = 'new';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var parsers   = require('../parsers');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

// custom parsers
var ini        = require('ini');
var yaml       = require('js-yaml');
var json5      = require('json5');

test('new', function(t)
{
  var data;

  t.plan(8);

  // -- default instance

  data = config({ directories: configDir });
  t.deepEqual(data, {
    fields: {
      field_1: '1 from js',
      field_2: '2 from json',
      field_3: '3 from json'
    }
  }, 'expect to get js and json files combined');

  data = config({ directories: configDir, parsers: {ini: ini.parse, json: null}});
  t.deepEqual(data, {
    fields: {
      field_0: '0 from ini',
      field_1: '1 from js',
      field_2: '2 from js'
    }
  }, 'expect to get ini and js files combined');

  // -- first level, no `js`

  config = config.new({parsers: {js: null}});

  data = config({ directories: configDir });
  t.deepEqual(data, {
    fields: {
      field_2: '2 from json',
      field_3: '3 from json'
    }
  }, 'expect to get just json file');

  data = config({ directories: configDir, parsers: {ini: ini.parse}});
  t.deepEqual(data, {
    fields: {
      field_0: '0 from ini',
      field_1: '1 from ini',
      field_2: '2 from json',
      field_3: '3 from json'
    }
  }, 'expect to get ini and json files combined');

  // -- second level, with `json5` and `yaml`

  config = config.new({parsers: {
    json5: json5.parse,
    yaml : function(str) { return yaml.safeLoad(str); }
  }});

  data = config({ directories: configDir });
  t.deepEqual(data, {
    fields: {
      field_2: '2 from json',
      field_3: '3 from json5',
      field_4: '4 from yaml',
      field_5: '5 from yaml'
    }
  }, 'expect to get json, json5 and yaml files combined');

  data = config({ directories: configDir, parsers: {ini: ini.parse}});
  t.deepEqual(data, {
    fields: {
      field_0: '0 from ini',
      field_1: '1 from ini',
      field_2: '2 from json',
      field_3: '3 from json5',
      field_4: '4 from yaml',
      field_5: '5 from yaml'
    }
  }, 'expect to get ini, json, json5 and yaml files combined');

  // -- three levels deep, with `ini` and `yml`

  config = config.new({parsers: {
    ini: ini.parse,
    yml: config.parsers.yaml
  }});

  data = config({ directories: configDir });
  t.deepEqual(data, {
    fields: {
      field_0: '0 from ini',
      field_1: '1 from ini',
      field_2: '2 from json',
      field_3: '3 from json5',
      field_4: '4 from yaml',
      field_5: '5 from yml',
      field_6: '6 from yml'
    }
  }, 'expect to get ini, json, json5, yaml and yml files combined');

  data = config({ directories: configDir, parsers: {js: parsers.js}});
  t.deepEqual(data, {
    fields: {
      field_0: '0 from ini',
      field_1: '1 from js',
      field_2: '2 from json',
      field_3: '3 from json5',
      field_4: '4 from yaml',
      field_5: '5 from yml',
      field_6: '6 from yml'
    }
  }, 'expect to get ini, js, json, json5, yaml and yml files combined');

});
