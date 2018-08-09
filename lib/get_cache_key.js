var path        = require('path')
  , typeOf      = require('precise-typeof')
  , getFiles    = require('./get_files.js')
  , resolveExts = require('./resolve_exts.js')
  ;

// Public API
module.exports = getCacheKey;

/**
 * Generates cache key from the search directories
 * and provided list of parsers
 *
 * @returns {string} - cache key
 */
function getCacheKey()
{
  // use the one from the context
  var directories = this.directories || this.defaults.directories;

  return resolveDir(directories)
    + ':'
    + getFiles.call(this, process.env).join(',')
    + ':'
    + resolveExts.call(this).join(',')
    ;
}

/**
 * Resolves `directories` argument into a absolute path
 *
 * @param   {array|string} directories - directories to resolve
 * @returns {string} - absolute path to the directories
 */
function resolveDir(directories)
{
  var directoriesAbsPath;

  if (typeOf(directories) == 'array')
  {
    directoriesAbsPath = directories.map(function(d)
    {
      return path.resolve(d);
    }).join('|');
  }
  else
  {
    directoriesAbsPath = path.resolve(directories);
  }

  return directoriesAbsPath;
}
