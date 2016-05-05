var path          = require('path')
  , fs            = require('fs')
  , os            = require('os')
  , merge         = require('deeply')
  , cloneFunction = require('deeply/lib/clone_function')
  , stripBOM      = require('strip-bom')
  // sub-modules
  , compare       = require('./compare.js')
  , parsers       = require('./parsers.js')
  // library files
  , envVars       = require('./lib/env_vars.js')
  , getFiles      = require('./lib/get_files.js')
  ;

// singleton cache object
configly._cache             = {};

// expose helper functions
configly.new                = createNew;
configly.load               = load;
configly.merge              = merge;
// internal helpers
configly.compareExtensions = compare.ascendingIgnoreCase;
configly.arrayMerge        = merge.adapters.array;

// "private" methods
configly.getFiles        = getFiles;

configly._loadFiles       = _loadFiles;
configly._copyProps       = _copyProps;
configly._applyProps      = _applyProps;
configly._applyHooks      = _applyHooks;
configly._resolveDir      = _resolveDir;
configly._resolveExts     = _resolveExts;
configly._getFilenames    = _getFilenames;
configly._getHostname     = _getHostname;
configly._getCacheKey     = _getCacheKey;
configly._loadContent     = _loadContent;
configly._mergeLayers     = _mergeLayers;

// defaults
configly.defaults = {
  directory    : './config',
  environment  : 'development',
  customEnvVars: 'custom-environment-variables'
};

// filename chunk separator
configly.separator = '-';

configly.parsers = parsers;

// post-processing hooks
// matched by the filename prefix
configly.hooks = {};
configly.hooks[configly.defaults.customEnvVars] = envVars;

// Public API
// return protected copy
module.exports = configly.new();

/**
 * Returns config object from the cache (determined by `dir`/`parsers` arguments),
 * if no cache record found, invokes `configly.load` function and caches the result
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {string} directory - directory to search for config files within
 * @param   {object} [options] - custom context to use for search and loading config files
 * @returns {object} - result merged config object
 */
function configly(directory, options)
{
  // determine current instance
  // if current context is a function
  // assume it as new configly instance
  // otherwise fallback to the original one
  var cacheKey;

  // create new running context with custom options
  var context = this.new(options || {});

  // fallback to default directory
  directory = directory || context.defaults.directory;

  // prepare cache key
  cacheKey = context._getCacheKey(directory);

  if (!this._cache[cacheKey])
  {
    this.load(directory, context);
  }

  // return immutable copy
  return merge(this._cache[cacheKey]);
}

/**
 * Creates new copy of configly
 * immutable to singleton modifications
 * which will help to keep it stable
 * when used with in the libraries
 *
 * @param   {object} [options] - custom options to set as new defaults on the new instance
 * @returns {function} - immutable copy of configly
 */
function createNew(options)
{
  var copy     = cloneFunction(configly)
    , instance = copy.bind(copy)
    ;

  // enrich copy with helper methods
  // mind baked-in context of the copies
  this._applyProps(copy, options);

  // get fresh list of filenames
  // if needed
  copy.files = copy.files || copy._getFilenames();

  // expose public methods on the outside
  // mind baked in context of the copies
  copy._copyProps(instance);

  return instance;
}

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
  cacheKey = context._getCacheKey(directory, context);

  // get config files names suitable for the situation
  files = context.getFiles(process.env);

  // load all available files
  layers = context._loadFiles(directory, files);

  // merge loaded layers
  this._cache[cacheKey] = context._mergeLayers(layers);

  // return immutable copy
  return merge(this._cache[cacheKey]);
}

/**
 * Loads and parses config from available files
 *
 * @param   {string} dir - directory to search in
 * @param   {array} files - list of files to search for
 * @returns {array} - list of loaded configs in order of provided files
 */
function _loadFiles(dir, files)
{
  // sort extensions to provide deterministic order of loading
  var extensions = this._resolveExts()
    , layers     = []
    ;

  files.forEach(function(filename)
  {
    var layer = {file: filename, exts: []};

    extensions.forEach(function(ext)
    {
      var cfg, file = path.resolve(dir, filename + '.' + ext);

      if (fs.existsSync(file))
      {
        cfg = this._loadContent(file, this.parsers[ext]);

        // check if any hooks needed to be applied
        cfg = this._applyHooks(cfg, filename);

        layer.exts.push({
          ext   : ext,
          config: cfg
        });
      }
    }.bind(this));

    // populate with non-empty layers only
    if (layer.exts.length)
    {
      layers.push(layer);
    }

  }.bind(this));

  return layers;
}

/**
 * Loads and parses provided file (synchronious).
 *
 * @param   {string} file - absolute path to the file
 * @param   {function} parser - function to parse provided content and return config object
 * @returns {object} - parsed config object
 */
function _loadContent(file, parser)
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
function _applyHooks(config, filename)
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
function _mergeLayers(layers)
{
  var _instance = this
    , result    = {}
    ;

  layers.forEach(function(layer)
  {
    layer.exts.forEach(function(cfg)
    {
      // have customizable's array merge function
      result = merge.call({useCustomAdapters: merge.behaviors.useCustomAdapters, 'array': _instance.arrayMerge}, result, cfg.config);
    });
  });

  return result;
}

/**
 * Applies properties from the source function onto target one
 *
 * @param   {function} target - function to enrich
 * @param   {object} [options] - custom props to overload with
 * @returns {function} enriched target
 */
function _applyProps(target, options)
{
  options = options || {};

  Object.keys(this).forEach(function(key)
  {
    // do not merge `undefined` into existing value
    target[key] = options.hasOwnProperty(key) ? merge(this[key], options[key]) : merge(this[key]);

    // special treatment for parsers
    // remove invalid parsers from the list
    if (key == 'parsers')
    {
      Object.keys(target[key]).forEach(function(parser)
      {
        if (typeof target[key][parser] != 'function')
        {
          delete target[key][parser];
        }
      });
    }

  }.bind(this));

  return target;
}

/**
 * Copies public properties to the provided target
 *
 * @param   {object} target - properties copy destination
 * @returns {object} - updated target object
 */
function _copyProps(target)
{
  Object.keys(this).forEach(function(key)
  {
    target[key] = typeof this[key] == 'function' ? this[key].bind(this) : this[key];
  }.bind(this));

  return target;
}

/**
 * Resolves `dir` argument into a absolute path
 *
 * @param   {string} dir - directory to resolve
 * @returns {string} - absolute path to the directory
 */
function _resolveDir(dir)
{
  return path.resolve(dir);
}

/**
 * Resolves parsers object into a string
 * of sorted extensions
 *
 * @returns {array} - sorted extensions  (e.g. `[cson, json, zson]`)
 */
function _resolveExts()
{
  return Object.keys(this.parsers).sort(this.compareExtensions);
}

/**
 * Generates cache key from the search directory
 * and provided list of parsers
 *
 * @param   {string} directory - search directory
 * @returns {string} - cache key
 */
function _getCacheKey(directory)
{
  return this._resolveDir(directory)
    + ':'
    + this.getFiles(process.env).join(',')
    + ':'
    + this._resolveExts().join(',')
    ;
}

/**
 * Detects hostname based on the environment
 *
 * @returns {string} - hostname or empty string
 */
function _getHostname()
{
  return process.env['HOST'] || process.env['HOSTNAME'] || os.hostname() || '';
}

/**
 * Creates list of filenames to search with
 *
 * @returns {array} - list of the filenames
 */
function _getFilenames()
{
  var hostname = this._getHostname()
    , host     = hostname.split('.')[0]
    ;

  return [
    'default',
    '', // allow suffixes as a basename (e.g. `environment`)
    host,
    hostname,
    'local',
    this.defaults.customEnvVars,
    'runtime'
  ];
}
