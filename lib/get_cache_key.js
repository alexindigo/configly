var path        = require('path')
  , typeOf      = require('precise-typeof')
  , getFiles    = require('./get_files.js')
  , resolveExts = require('./resolve_exts.js')
  ;

// Public API
module.exports = getCacheKey;

/**
 * Generates cache key from the search directory
 * and provided list of parsers
 *
 * @param   {string} [directory] - search directory
 * @returns {string} - cache key
 */
function getCacheKey(directory)
{
  // use the one from the context
  directory = directory || this.directory;

  return resolveDir(directory)
    + ':'
    + getFiles.call(this, process.env).join(',')
    + ':'
    + resolveExts.call(this).join(',')
    ;
}

/**
 * Resolves `dir` argument into a absolute path
 *
 * @param   {string} dir - directory to resolve
 * @returns {string} - absolute path to the directory
 */
function resolveDir(dir)
{
  var dirStr;

  if (typeOf(dir) == 'array')
  {
    dirStr = dir.map(function(d)
    {
      return path.resolve(d);
    }).join('|');
  }
  else
  {
    dirStr = path.resolve(dir);
  }

  return dirStr;
}
