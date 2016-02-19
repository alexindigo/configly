var Module = require('module')
  , path   = require('path')
  , fs     = require('fs')
  , os     = require('os')
  // local files
  , customEnvHook = require('./lib/custom_env_hook')
  ;

// Public API
module.exports = configly;

// singleton cache object
configly._cache = {};

// expose helper functions
configly.load               = load;
// "private" methods
configly._stripBOM          = stripBOM;
configly._getFiles          = getFiles;
configly._loadFiles         = loadFiles;
configly._applyHooks        = applyHooks;
configly._resolveDir        = resolveDir;
configly._resolveExts       = resolveExts;
configly._loadContent       = loadContent;
configly._mergeLayers       = mergeLayers;
configly._compareExtensions = compareExtensions;

// name constants
configly.FILES = {
  default: 'default',
  local  : 'local',
  custom : 'custom-environment-variables',
  runtime: 'runtime',
  // separator
  '-'    : '-'
};

// by default use just `js` and `json` parsers
configly.PARSERS = {
  js  : jsCompile,
  json: JSON.parse
};

// post-processing hooks
// matched by the filename prefix
configly.HOOKS = {};
configly.HOOKS[configly.FILES.custom] = customEnvHook;

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
  var extensions
    , cacheKey
    , result
    ;

  // fallback to default parsers if needed
  parsers = parsers || configly.PARSERS;

  // prepare cache keys
  directory  = configly._resolveDir(directory);
  extensions = configly._resolveExts(parsers);
  cacheKey   = directory + ':' + extensions;

  if (!configly._cache[cacheKey])
  {
    configly._cache[cacheKey] = configly.load(directory, parsers);
  }

  result = configly._cache[cacheKey];

  return result;
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
  var files, layers, result;

  // fallback to default parsers if needed
  parsers = parsers || configly.PARSERS;

  // get config files names suitable for the situation
  files = configly._getFiles(process.env);
console.log('files', files, '\n\n');

  // load all available files
  layers = configly._loadFiles(directory, files, parsers);
console.log('layers', JSON.stringify(layers, null, '  '), '\n\n');

  // merge loaded layers
  result = configly._mergeLayers(layers);
console.log('result', result, '\n\n');

  return result;
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
    , environment = env['NODE_ENV'] || 'development'
    , appInstance = env['NODE_APP_INSTANCE'] ? configly.FILES['-'] + env['NODE_APP_INSTANCE'] : ''
    , hostname    = env['HOST'] || env['HOSTNAME'] || os.hostname() || ''
    , host        = hostname.split('.')[0]
    ;

  // populate files list in specific order
  addIfNotEmpty(files,
    configly.FILES.default,
    configly.FILES.default + appInstance);

  // environment specific config (bread and butter of the functionality)
  addIfNotEmpty(files,
    environment,
    environment + appInstance);

  // add host
  addIfNotEmpty(files,
    host,
    host + appInstance,
    host + configly.FILES['-'] + environment,
    host + configly.FILES['-'] + environment + appInstance);

  // and full hostname
  addIfNotEmpty(files,
    hostname,
    hostname + appInstance,
    hostname + configly.FILES['-'] + environment,
    hostname + configly.FILES['-'] + environment + appInstance);

  // local configuration
  addIfNotEmpty(files,
    configly.FILES.local,
    configly.FILES.local + appInstance,
    configly.FILES.local + configly.FILES['-'] + environment,
    configly.FILES.local + configly.FILES['-'] + environment + appInstance);

  // look for environment variables advanced mapping
  addIfNotEmpty(files,
    configly.FILES.custom,
    configly.FILES.custom + appInstance,
    configly.FILES.custom + configly.FILES['-'] + environment,
    configly.FILES.custom + configly.FILES['-'] + environment + appInstance);

  // it is backwards compatibility in the `config` module, but why not?
  addIfNotEmpty(files, configly.FILES.runtime);

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
  var extensions = Object.keys(parsers).sort(configly._compareExtensions)
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
    throw new Error('Config file ' + file + ' cannot be read.');
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
  return layers;
}

/**
 * Adds new element to the list
 * if element if not empty (`undefined`, `null`, `''`)
 * Also checks for duplicates
 *
 * @param {array} list - array to add element to
 * @param {...mixed} element - element to compare against, affects rest of the arguments
 */
function addIfNotEmpty(list, element)
{
  var args = Array.prototype.slice.call(arguments, 1);

  if (element != null && element.toString().length > 0)
  {
    args.forEach(function(el)
    {
      if (list.indexOf(el) == -1) list.push(el);
    });
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
  return Object.keys(parsers).sort().join(',');
}

/**
 * Compiles js content in the manner it's done
 * in the node itself
 *
 * @param   {string} content - file's content
 * @param   {string} file - full path of the file
 * @returns {mix} - result javascript object
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

/**
 * Compares extensions alphabetically (ascending)
 *
 * @param   {string} a - array element to compare
 * @param   {string} b - array element to compare
 * @returns {number} - ordering criterion
 */
function compareExtensions(a, b)
{
  return a === b ? 0 : (a < b ? -1 : 1);
}

/**
 * Removes Byte Order Marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 * Copied from nodejs project.
 *
 * @param   {string} content - content to clean up
 * @returns {string} - string without BOM
 */
function stripBOM(content)
{
  if (content.charCodeAt(0) === 0xFEFF)
  {
    content = content.slice(1);
  }
  return content;
}

  //
  // var extNames = ['js', 'json', 'json5', 'hjson', 'toml', 'coffee', 'iced', 'yaml', 'yml', 'cson', 'properties'];
  //
  // // Override with environment variables if there is a custom-environment-variables.EXT mapping file
  // var customEnvVars = util.getCustomEnvVars(CONFIG_DIR, extNames);
  // util.extendDeep(config, customEnvVars);
  //




// util.substituteDeep = function (substitutionMap, variables) {
//   var result = {};
//
//   function _substituteVars(map, vars, pathTo) {
//     for (var prop in map) {
//       var value = map[prop];
//       if (typeof(value) === 'string') { // We found a leaf variable name
//         if (vars[value]) { // if the vars provide a value set the value in the result map
//           util.setPath(result, pathTo.concat(prop), vars[value]);
//         }
//       }
//       else if (util.isObject(value)) { // work on the subtree, giving it a clone of the pathTo
//         if('__name' in value && '__format' in value && vars[value.__name]) {
//           var parsedValue = util.parseString(vars[value.__name], value.__format);
//           util.setPath(result, pathTo.concat(prop), parsedValue);
//         } else {
//           _substituteVars(value, vars, pathTo.concat(prop));
//         }
//       }
//       else {
//         msg = "Illegal key type for substitution map at " + pathTo.join('.') + ': ' + typeof(value);
//         throw Error(msg);
//       }
//     }
//   }
//
//   _substituteVars(substitutionMap, variables, []);
//   return result;
//
// };
