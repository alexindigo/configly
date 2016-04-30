var testName  = 'new';
var test      = require('tape');
var path      = require('path');
var config    = require('../');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

// // custom lookup file
// // inject one before `local` basename
// // modify properties in place (be careful in production code)
// config.files.splice(config.files.indexOf('local'), 0, 'test-custom');

// custom parsers

// plugins
var ini        = require('ini');
// var yaml       = require('js-yaml');
// var json5      = require('json5');


// assemble shortlist
// var parsersShortList = {
//   ini       : ini.parse,
//   // have it as a wrapper to prevent extra arguments leaking
//   yml       : function(str) { return yaml.safeLoad(str); },
//   // use json5 for regular json files
//   json      : json5.parse,
//   // exclude default parser explicitly
//   js        : null
// };

// // get them all
// var parsersLongList = merge(parsersShortList, {
//   hjson : hjson.parse,
//   toml  : toml.parse,
//   // coffee-script requires some wrapping too
//   coffee: coffeeCompile,
//   // put json5 back to it's specific extension
//   json5 : json5.parse,
//   // make yaml to parse two extensions
//   yaml  : parsersShortList.yml,
//   // add reuse original parsers
//   js    : config.parsers.js,
//   json  : config.parsers.json
// });

test('new', function(t)
{
  var data;

  t.plan(4);

  data = config(configDir);
  t.deepEqual(data, {
    fields: {
      field_1: '1 from js',
      field_2: '2 from json',
      field_3: '3 from json'
    }
  }, 'expect to get js and json files combined');

  data = config(configDir, {parsers: {ini: ini.parse, json: null}});
  t.deepEqual(data, {
    fields: {
      field_0: '0 from ini',
      field_1: '1 from js',
      field_2: '2 from js'
    }
  }, 'expect to get ini and js files combined');

  config = config.new({parsers: {js: null}});

  data = config(configDir);
  t.deepEqual(data, {
    fields: {
      field_2: '2 from json',
      field_3: '3 from json'
    }
  }, 'expect to get just json file');

  data = config(configDir, {parsers: {ini: ini.parse}});
  t.deepEqual(data, {
    fields: {
      field_0: '0 from ini',
      field_1: '1 from ini',
      field_2: '2 from json',
      field_3: '3 from json'
    }
  }, 'expect to get ini and json files combined');


  // var configObj
  //     // and using new copy
  //   , configWithShortList    = config.new({parsers: parsersShortList})
  //   , configWithLongList     = config.new({parsers: parsersLongList})
  //   , configWithLongListDesc = config.new({parsers: parsersLongList, compareExtensions: config.compare.descendingIgnoreCase})
  //   ;

  // get short list first, and keep original
// console.log('\n\n............ parsersShortList >', Object.keys(parsersShortList).join(', '), '< ..........\n');
//   configObj = config(configDir, {parsers: parsersShortList});
// console.log('\n............ /////parsersShortList ..........\n\n');
//   t.deepEqual(configObj, expectedShort, 'expects to get proper config object for the short list');
  //
  // configObj = configWithShortList(configDir);
  // t.deepEqual(configObj, expectedShort, 'expects to get proper config object for copy of the short list');
  //
  // // get all the files
  // configObj = config(configDir, {parsers: parsersLongList});
  // t.deepEqual(configObj, expectedAll, 'expects to get proper config object for the full list');
  //
  // configObj = configWithLongList(configDir);
  // t.deepEqual(configObj, expectedAll, 'expects to get proper config object for copy of the full list');
  //
  // // get all the files with extensions in reversed order
  // // replace default compare function with opposite one,
  // // since extension yield different order,
  // // it would pass the cache and re-read files one more time
  // configObj = config(configDir, {parsers: parsersLongList, compareExtensions: config.compare.descendingIgnoreCase});
  // t.deepEqual(configObj, expectedReversed, 'expects to get proper config object for the full list and reversed extensions');
  //
  // configObj = configWithLongListDesc(configDir);
  // t.deepEqual(configObj, expectedReversed, 'expects to get proper config object for copy of the full list and reversed extensions');

});
