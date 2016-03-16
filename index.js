var Module   = require('module')
  , path     = require('path')
  , fs       = require('fs')
  , os       = require('os')
  , merge    = require('deeply')
  , stripBOM = require('strip-bom')
  , compare  = require('compare-property')
  // local files
  , envVars     = require('./lib/env_vars.js')
  , notEmpty    = require('./lib/not_empty.js')
  , parseTokens = require('./lib/parse_tokens.js')
  // static
  , hostname = process.env['HOST'] || process.env['HOSTNAME'] || os.hostname() || ''
  , host     = hostname.split('.')[0]
  ;

// Public API
module.exports = configly;

// singleton cache object
configly._cache = {};

// expose helper functions
configly.load               = load;
configly.merge              = merge;
// "private" methods
configly._stripBOM          = stripBOM;
configly._getFiles          = getFiles;
configly._loadFiles         = loadFiles;
configly._arrayMerge        = merge.adapters.array;
configly._applyHooks        = applyHooks;
configly._resolveDir        = resolveDir;
configly._resolveExts       = resolveExts;
configly._getCacheKey       = getCacheKey;
configly._loadContent       = loadContent;
configly._mergeLayers       = mergeLayers;
configly._compare           = compare;
configly._compareExtensions = compare.ascendingIgnoreCase;

// defaults
configly.DEFAULTS = {
  directory    : './config',
  environment  : 'development',
  customEnvVars: 'custom-environment-variables'
};

// filename chunk separator
configly.SEPARATOR = '-';

// file base names
configly.FILES = [
  'default',
  '', // allow suffixes as a basename (e.g. `environment`)
  host,
  hostname,
  'local',
  configly.DEFAULTS.customEnvVars,
  'runtime'
];

// by default use just `js` and `json` parsers
configly.PARSERS = {
  js  : jsCompile,
  json: JSON.parse
};

// post-processing hooks
// matched by the filename prefix
configly.HOOKS = {};
configly.HOOKS[configly.DEFAULTS.customEnvVars] = envVars;


/**
 * Returns config object from the cache (determined by `dir`/`parsers` arguments),
 * if no cache record found, invokes `configly.load` function and caches the result
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {string} directory - directory to search for config files within
 * @param   {object} [parsers] - custom parsers to use to search and load config files with
 * @returns {object} - result merged config object
 */
function configly(directory, parsers)
{
  var cacheKey;

  // fallback to defaults
  directory = directory || configly.DEFAULTS.directory;
  parsers   = parsers || configly.PARSERS;

  // prepare cache key
  cacheKey = configly._getCacheKey(directory, parsers);

  if (!configly._cache[cacheKey])
  {
    configly.load(directory, parsers);
  }

  // return immutable copy
  return merge(configly._cache[cacheKey]);
}

/**
 * Loads config objects from several environemnt-derived files
 * and merges them in specific order.
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {string} directory - directory to search for config files within
 * @param   {object} [parsers] - custom parsers to use to search and load config files with
 * @returns {object} - result merged config object
 */
function load(directory, parsers)
{
  var files
    , layers
    , cacheKey
    ;

  // fallback to defaults
  directory = directory || configly.DEFAULTS.directory;
  parsers   = parsers || configly.PARSERS;

  // prepare cache key
  cacheKey = configly._getCacheKey(directory, parsers);

  // get config files names suitable for the situation
  files = configly._getFiles(process.env);

  // load all available files
  layers = configly._loadFiles(directory, files, parsers);

  // merge loaded layers
  configly._cache[cacheKey] = configly._mergeLayers(layers);

  // return immutable copy
  return merge(configly._cache[cacheKey]);
}

/**
 * Creates list of files to load configuration from
 * derived from the passed environment-like object
 *
 * @param   {object} env - environment-like object (e.g. `process.env`)
 * @returns {array} - ordered list of config files to load
 */
function getFiles(env)
{
  var files       = []
    , environment = env['NODE_ENV'] || configly.DEFAULTS.environment
    , appInstance = env['NODE_APP_INSTANCE']
    ;

  // generate config files variations
  configly.FILES.forEach(function(baseName)
  {
    // check for variables
    // keep baseName if no variables found
    baseName = parseTokens(baseName, env) || baseName;

    // add base name with available suffixes
    addWithSuffixes(files, baseName, appInstance);
    addWithSuffixes(files, baseName, environment, appInstance);
  });

  return files;
}

/**
 * Loads and parses config from available files
 *
 * @param   {string} dir - directory to search in
 * @param   {array} files - list of files to search for
 * @param   {object} parsers - list of extensions to use with parsers for each
 * @returns {array} - list of loaded configs in order of provided files
 */
function loadFiles(dir, files, parsers)
{
  // sort extensions to provide deterministic order of loading
  var extensions = configly._resolveExts(parsers)
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
        cfg = configly._loadContent(file, parsers[ext]);

        // check if any hooks needed to be applied
        cfg = configly._applyHooks(cfg, filename);

        layer.exts.push({
          ext   : ext,
          config: cfg
        });
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
  Object.keys(configly.HOOKS).forEach(function(hook)
  {
    // in order to match hook should either the same length
    // as the filename or smaller
    if (filename.substr(0, hook.length) === hook)
    {
      config = configly.HOOKS[hook](config);
    }
  });

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
  var result = {};

  layers.forEach(function(layer)
  {
    layer.exts.forEach(function(cfg)
    {
      // have customizable's array merge function
      result = merge.call({useCustomAdapters: merge.behaviors.useCustomAdapters, 'array': configly._arrayMerge}, result, cfg.config);
    });
  });

  return result;
}

/**
 * Adds new element to the list,
 * adds provided suffixes iteratively
 * adding them to the baseName (if not empty)
 * Also checks for duplicates
 *
 * @param {array} list - array to add element to
 * @param {string} baseName - element to compare against, affects rest of the arguments
 * @param {...string} [suffix] - additional suffixes to use with the `baseName`
 */
function addWithSuffixes(list, baseName)
{
  var suffixes = Array.prototype.slice.call(arguments, 2);

  // don't push empty baseName by itself
  notEmpty(baseName) && pushUniquely(list, baseName);

  suffixes.forEach(function(suffix)
  {
    // filter out empty suffixes
    // and extend baseName
    if (notEmpty(suffix))
    {
      baseName += (baseName ? configly.SEPARATOR : '') + suffix;
      pushUniquely(list, baseName);
    }
  });
}

/**
 * Pushes element into the array,
 * only if such element is not there yet
 *
 * @param   {array} list - array to add element into
 * @param   {mixed} element - element to add
 */
function pushUniquely(list, element)
{
  if (list.indexOf(element) == -1)
  {
    list.push(element);
  }
}

/**
 * Resolves `dir` argument into a absolute path
 *
 * @param   {string} dir - directory to resolve
 * @returns {string} - absolute path to the directory
 */
function resolveDir(dir)
{
  return path.resolve(dir);
}

/**
 * Resolves parsers object into a string
 * of sorted extensions
 *
 * @param   {object} parsers - list of parsers with corresponding extensions
 * @returns {string} - sorted extensions string (e.g. `cson,json,zson`)
 */
function resolveExts(parsers)
{
  return Object.keys(parsers).sort(configly._compareExtensions);
}

/**
 * Generates cache key from the search directory
 * and provided list of parsers
 *
 * @param   {string} directory - search directory
 * @param   {object} parsers - list of parsers
 * @returns {string} - cache key
 */
function getCacheKey(directory, parsers)
{
  return configly._resolveDir(directory) + ':' + configly._resolveExts(parsers).join(',');
}

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
