var path   = require('path')
  , Module = require('module')
  ;

// by default use just `js` and `json` parsers
module.exports = {
  js  : jsCompile,
  json: JSON.parse
};

/**
 * Compiles js content in the manner it's done
 * in the node itself
 *
 * @param   {string} content - file's content
 * @param   {string} file - full path of the file
 * @returns {mixed} - result javascript object
 */
function jsCompile(content, file)
{
  // make it as a child of this module
  // Would be nice to actually make it transparent
  // and pretend it to be child of the caller module
  // but there is no obvious way, yet
  var jsMod = new Module(file, module);

  // override parents to exclude configly from the chain
  // it's like this js file is included directly
  // from the file that included `configly`
  while (jsMod.parent
    && typeof jsMod.parent.id === 'string'
    && jsMod.parent.id.match(/\/node_modules\/configly\//)
    && jsMod.parent.parent) {
    jsMod.parent = jsMod.parent.parent;
  }

  // generate node_modules paths for the file
  jsMod.paths = Module._nodeModulePaths(path.dirname(file));

  // execute the module
  jsMod._compile(content, file);
  // return just exported object
  return jsMod.exports;
}
