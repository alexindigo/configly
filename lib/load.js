var path        = require('path')
  , fs          = require('fs')
  , merge       = require('deeply')
  , typeOf      = require('precise-typeof')
  , stripBOM    = require('strip-bom')
  , getCacheKey = require('./get_cache_key.js')
  , getFiles    = require('./get_files.js')
  , resolveExts = require('./resolve_exts.js')
  ;

// Public API
module.exports = load;

/**
 * Loads config objects from several environment-derived files
 * and merges them in specific order.
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {string} directory - directory to search for config files within
 * @param   {object} [context] - custom context to use for search and loading config files
 * @returns {object} - result merged config object
 */
function load(directory, context)
{
  var files
    , layers
    , cacheKey
    ;

  // create new context
  // in case if function called directly with options object
  context = typeof context == 'function' ? context : this.new(context || {});

  // fallback to defaults
  directory = directory || context.defaults.directory;

  // prepare cache key
  cacheKey = getCacheKey.call(context, directory);

  // get config files names suitable for the situation
  files = getFiles.call(context, process.env);

  // load all available files
  layers = loadFiles.call(context, directory, files);

  // merge loaded layers
  this._cache[cacheKey] = mergeLayers.call(context, layers);

  // return immutable copy
  return merge(this._cache[cacheKey]);
}

/**
 * Loads and parses config from available files
 *
 * @param   {string} dirs - directory to search in
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
 * Loads and parses provided file (synchronious).
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
    // provide filepath as the second argument for complex parsing,
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

/**
 * Applies matched hooks
 *
 * @param   {object} config - config object to apply hooks to
 * @param   {string} filename - base filename to match hooks against
 * @returns {object} - modified config object
 */
function applyHooks(config, filename)
{
  Object.keys(this.hooks).forEach(function(hook)
  {
    // in order to match hook should either the same length
    // as the filename or smaller
    if (filename.substr(0, hook.length) === hook)
    {
      config = this.hooks[hook](config);
    }
  }.bind(this));

  return config;
}

/**
 * Merges provided layers into a single config object,
 * respecting order of the layers
 *
 * @param   {array} layers - list of config objects
 * @returns {object} - single config object
 */
function mergeLayers(layers)
{
  var _instance = this
    , result    = {}
    ;

  layers.forEach(function(layer)
  {
    layer.exts.forEach(function(ext)
    {
      ext.dirs.forEach(function(cfg)
      {
        // have customizable's array merge function
        result = merge.call({
          useCustomAdapters: merge.behaviors.useCustomAdapters,
          'array': _instance.arrayMerge
        }, result, cfg.config);
      });
    });
  });

  return result;
}
