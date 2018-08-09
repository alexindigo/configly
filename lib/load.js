var merge       = require('deeply')
  , typeOf      = require('precise-typeof')
  , getCacheKey = require('./get_cache_key.js')
  , getFiles    = require('./get_files.js')
  , loadFiles   = require('./load_files.js')
  , mergeLayers = require('./merge_layers.js')
  ;

// Public API
module.exports = load;

/**
 * Loads config objects from several environment-derived files
 * and merges them in specific order.
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {function|object} [context] - custom context to use for search and loading config files
 * @returns {object} - result merged config object
 */
function load(context)
{
  var files
    , layers
    , cacheKey
    ;

  // TODO: make it proper optional param
  context = context || {};

  // create new context
  // in case if `load` called without context
  context = typeOf(context) == 'function' ? context : this.new(context);

  // fallback to defaults
  context.directories = context.directories || context.defaults.directories;

  // prepare cache key
  cacheKey = getCacheKey.call(context);

  // get config files names suitable for the situation
  files = getFiles.call(context, process.env);

  // load all available files
  layers = loadFiles.call(context, context.directories, files);

  // merge loaded layers
  this._cache[cacheKey] = mergeLayers.call(context, layers);

  // return immutable copy
  return merge(this._cache[cacheKey]);
}
