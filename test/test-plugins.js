var testName  = 'plugins';
var test      = require('tape');
var path      = require('path');
var merge     = require('deeply');
var config    = require('../');
var compare   = require('../compare');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

// custom lookup file
// inject one before `local` basename
// modify properties in place (be careful in production code)
config.files.splice(config.files.indexOf('local'), 0, 'test-custom');

// custom parsers

// short list
var ini        = require('ini');
var cson       = require('cson');
var yaml       = require('js-yaml');
var properties = require('properties');
var json5      = require('json5');

// the rest
var coffeeScript = require('coffee-script');
var hjson        = require('hjson');
var toml         = require('toml');

var expectedShort    = require('./fixtures/expected/' + testName + '-shortlist.json');
var expectedAll      = require('./fixtures/expected/' + testName + '-all.json');
var expectedReversed = require('./fixtures/expected/' + testName + '-all-reversed.json');

// assemble shortlist
var parsersShortList = {
  ini       : ini.parse,
  // have it as a wrapper to prevent extra arguments leaking
  cson      : function(str) { return cson.parse(str); },
  yml       : function(str) { return yaml.safeLoad(str); },
  // same options as used within `config` module
  properties: function(str) { return properties.parse(str, {namespaces: true, variables: true, sections: true}); },
  // use json5 for regular json files
  json      : json5.parse,
  // exclude default parser explicitly
  js        : null
};

// get them all
var parsersLongList = merge(parsersShortList, {
  hjson : hjson.parse,
  toml  : toml.parse,
  // coffee-script requires some wrapping too
  coffee: coffeeCompile,
  // put json5 back to it's specific extension
  json5 : json5.parse,
  // make yaml to parse two extensions
  yaml  : parsersShortList.yml,
  // add reuse original parsers
  js    : config.parsers.js,
  json  : config.parsers.json
});

test('plugins', function(t)
{
  t.plan(6);

  var configObj
      // and using new copy
    , configWithShortList    = config.new({parsers: parsersShortList})
    , configWithLongList     = config.new({parsers: parsersLongList})
    , configWithLongListDesc = config.new({parsers: parsersLongList, compareExtensions: compare.descendingIgnoreCase})
    ;

  // augment `process.env` for stable testing`
  process.env['NODE_APP_INSTANCE'] = 3;
  process.env['EMPTY_VAR']         = '';
  process.env['TESTLINEONE']       = 'ABC';
  process.env['TESTLINETWO']       = 'XYZ';
  process.env['JUST_VAR']          = 'A VAR';
  process.env['VARPART1']          = 'COMBINED VAR 1/2';
  process.env['VARPART2']          = 'COMBINED VAR 2/2';

  // get short list first, and keep original
  configObj = config(configDir, {parsers: parsersShortList});
  t.deepEqual(configObj, expectedShort, 'expects to get proper config object for the short list');

  configObj = configWithShortList(configDir);
  t.deepEqual(configObj, expectedShort, 'expects to get proper config object for copy of the short list');

  // get all the files
  configObj = config(configDir, {parsers: parsersLongList});
  t.deepEqual(configObj, expectedAll, 'expects to get proper config object for the full list');

  configObj = configWithLongList(configDir);
  t.deepEqual(configObj, expectedAll, 'expects to get proper config object for copy of the full list');

  // get all the files with extensions in reversed order
  // replace default compare function with opposite one,
  // since extension yield different order,
  // it would pass the cache and re-read files one more time
  configObj = config(configDir, {parsers: parsersLongList, compareExtensions: compare.descendingIgnoreCase});
  t.deepEqual(configObj, expectedReversed, 'expects to get proper config object for the full list and reversed extensions');

  configObj = configWithLongListDesc(configDir);
  t.deepEqual(configObj, expectedReversed, 'expects to get proper config object for copy of the full list and reversed extensions');

});

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
  return config.parsers.js(properJs, file);
}
