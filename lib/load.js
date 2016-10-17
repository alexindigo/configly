var path        = require('path')
  , fs          = require('fs')
  , merge       = require('deeply')
  , typeOf      = require('precise-typeof')
  , stripBOM    = require('stripbom')
  , applyHooks  = require('./apply_hooks.js')
  , getCacheKey = require('./get_cache_key.js')
  , getFiles    = require('./get_files.js')
  , mergeLayers = require('./merge_layers.js')
  , resolveExts = require('./resolve_exts.js')
  ;

// Public API
module.exports = load;

/**
 * Loads config objects from several environment-derived files
 * and merges them in specific order.
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {string} [directory] - directory to search for config files within
 * @param   {function|object} [context] - custom context to use for search and loading config files
 * @returns {object} - result merged config object
 */
function load(directory, context)
{
  var files
    , layers
    , cacheKey
    ;

  context = context || {};

  // function|object passed as the first argument
  // consider it `context`
  if (typeOf(directory) == 'function' || typeOf(directory) == 'object')
  {
    context   = directory;
    directory = context.directory;
  }

  // create new context
  // in case if `load` called without context
  context = typeOf(context) == 'function' ? context : this.new(context);

  // fallback to defaults
  context.directory = directory || context.directory || context.defaults.directory;

  // prepare cache key
  cacheKey = getCacheKey.call(context);

  // get config files names suitable for the situation
  files = getFiles.call(context, process.env);

  // load all available files
  layers = loadFiles.call(context, context.directory, files);

  // merge loaded layers
  this._cache[cacheKey] = mergeLayers.call(context, layers);

  // return immutable copy
  return merge(this._cache[cacheKey]);
}

/**
 * Loads and parses config from available files
 *
 * @param   {string|array} dirs - directory to search in
 * @param   {array} files - list of files to search for
 * @returns {array} - list of loaded configs in order of provided files
 */
function loadFiles(dirs, files)
{
  // sort extensions to provide deterministic order of loading
  var _instance  = this
    , extensions = resolveExts.call(this)
    , layers     = []
    ;

  // treat all inputs as list of directories
  dirs = (typeOf(dirs) == 'array') ? dirs : [dirs];

  files.forEach(function(filename)
  {
    var layer = {file: filename, exts: []};

    extensions.forEach(function(ext)
    {
      var layerExt = {ext: ext, dirs: []};

      dirs.forEach(function(dir)
      {
        var cfg, file = path.resolve(dir, filename + '.' + ext);

        if (fs.existsSync(file))
        {
          cfg = loadContent.call(_instance, file, _instance.parsers[ext]);

          // check if any hooks needed to be applied
          cfg = applyHooks.call(_instance, cfg, filename);
        }

        if (cfg)
        {
          layerExt.dirs.push({
            dir   : dir,
            config: cfg
          });
        }
      });

      // populate with non-empty layers only
      if (layerExt.dirs.length)
      {
        layer.exts.push(layerExt);
      }
    });

    // populate with non-empty layers only
    if (layer.exts.length)
    {
      layers.push(layer);
    }

  });

  return layers;
}

/**
 * Loads and parses provided file (synchronous).
 *
 * @param   {string} file - absolute path to the file
 * @param   {function} parser - function to parse provided content and return config object
 * @returns {object} - parsed config object
 */
function loadContent(file, parser)
{
  var content, config;

  try
  {
    content = stripBOM(fs.readFileSync(file, {encoding: 'utf8'}));
    // provide file path as the second argument for complex parsing,
    // also it matches `module._compile` nodejs API.
    // Note: JSON.parse accepts two arguments, but ignores anything
    // but function on the second place, so it's safe to pass a filename
    // Other parsers might need to have wrappers.
    config = parser(content, file);
  }
  catch (e)
  {
    throw new Error('Config file ' + file + ' cannot be read or malformed.');
  }

  return config;
}
