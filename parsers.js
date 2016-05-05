var Module = require('module');

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
  jsMod._compile(content, file);
  // return just exported object
  return jsMod.exports;
}
