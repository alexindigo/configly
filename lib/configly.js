var clone       = require('deeply')
  , getCacheKey = require('./get_cache_key.js')
  ;

// Public API
module.exports = configly;

/**
 * Returns config object from the cache (determined by `dir`/`parsers` arguments),
 * if no cache record found, invokes `configly.load` function and caches the result
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {object} [options] - custom context to use for search and loading config files
 * @returns {object} - result merged config object
 */
function configly(options)
{
  var cacheKey, context;

  // create new running context with custom options
  // fallback to default directories
  context = this.new(clone(options || {}));

  // prepare cache key
  cacheKey = getCacheKey.call(context);

  if (!(cacheKey in this._cache))
  {
    this.load(context);
  }

  // return immutable copy
  // always return object here
  return clone.call({
    useCustomTypeOf: clone.behaviors.useCustomTypeOf,
    'typeof': context.mergeTypeOf
  }, this._cache[cacheKey] || {});
}
