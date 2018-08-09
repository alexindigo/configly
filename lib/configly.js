var typeOf      = require('precise-typeof')
  , merge       = require('deeply')
  , getCacheKey = require('./get_cache_key.js')
  ;

// Public API
module.exports = configly;

/**
 * Returns config object from the cache (determined by `dir`/`parsers` arguments),
 * if no cache record found, invokes `configly.load` function and caches the result
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {array|string} [directories] - directories to search for config files within
 * @param   {object} [options] - custom context to use for search and loading config files
 * @returns {object} - result merged config object
 */
function configly(directories, options)
{
  var cacheKey, context;

  // object passed as the first argument
  // consider it `options`
  if (typeOf(directories) == 'object')
  {
    options   = directories;
    directories = undefined;
  }

  // create new running context with custom options
  // fallback to default directories
  context = this.new(merge(options || {}, {directories: directories || this.defaults.directories}));

  // prepare cache key
  cacheKey = getCacheKey.call(context);

  if (!(cacheKey in this._cache))
  {
    this.load(context);
  }

  // return immutable copy
  // always return object here
  return merge(this._cache[cacheKey] || {});
}
