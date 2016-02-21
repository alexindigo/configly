var testName = 'plugins';
var tap      = require('tap');
var path     = require('path');
var merge    = require('deeply');
var config   = require('../');

// TODO: custom names - `test.yaml`

// custom parsers

// short list
var ini        = require('ini');
var cson       = require('cson');
var yaml       = require('js-yaml');
var properties = require ('properties');
var json5      = require('json5');

// the rest
var coffeeScript = require('coffee-script');
var hjson        = require('hjson');
var toml         = require('toml');

var expectedShort = require('./fixtures/expected/' + testName + '-shortlist.json');
var expectedAll   = require('./fixtures/expected/' + testName + '-all.json');

// assemble shortlist
var parsersShortList = {
  ini       : ini.parse,
  // have it as a wrapper to prevent extra arguments leaking
  cson      : function(str) { return cson.parse(str); },
  yml       : function(str) { return yaml.safeLoad(str); },
  // same options as used within `config` module
  properties: function(str) { return properties.parse(str, {namespaces: true, variables: true, sections: true}); },
  // use json5 for regular json files
  json: json5.parse
};

// get them all
var parsersAll = merge(parsersShortList, {
  hjson : hjson.parse,
  toml  : toml.parse,
  // coffee-script requires some wrapping too
  coffee: coffeeCompile,
  // put json5 back to it's specific extension
  json5 : json5.parse,
  // make yaml to parse two extensions
  yaml  : parsersShortList.yml,
  // add reuse original parsers
  js    : config.PARSERS.js,
  json  : config.PARSERS.json
});

var configObj;

// augment `process.env` for stable testing`
process.env['NODE_APP_INSTANCE'] = 3;
process.env['EMPTY_VAR']   = '';
process.env['TESTLINEONE'] = 'ABC';
process.env['TESTLINETWO'] = 'XYZ';
process.env['JUST_VAR']    = 'A VAR';
process.env['VARPART1']    = 'COMBINED VAR 1/2';
process.env['VARPART2']    = 'COMBINED VAR 2/2';

// get short list first, and keep original
configObj = config(path.join(__dirname, 'fixtures/config/' + testName), parsersShortList);
tap.same(configObj, expectedShort, 'expects to get proper config object for the short list');

// get all the files
configObj = config(path.join(__dirname, 'fixtures/config/' + testName), parsersAll);
tap.same(configObj, expectedAll, 'expects to get proper config object for the full list');

/**
 * Compiles coffee-script content
 *
 * @param   {string} content - file's content
 * @param   {string} file - full path of the file
 * @returns {mixed} - result javascript object
 */
function coffeeCompile(content, file)
{
  // first transpile coffee-script into javascript
  var properJs = coffeeScript.compile(content, {
    filename : file,
    sourceMap: false,
    inlineMap: false
  });

  // then proceed as usual with fetched js content
  return config.PARSERS.js(properJs, file);
}
