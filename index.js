var os = require('os');

// Public API
module.exports = config;

// expose helper functions
module.exports.getFiles = getFiles;

// Names constants
config.FILES = {
  default: 'default',
  local  : 'local',
  custom : 'custom-environment-variables',
  runtime: 'runtime',
  // separator
  '-'    : '-'
};

/**
 * Loads config objects from several environemnt-derived files
 * and merges them in specific order.
 * By default it loads JSON files, also custom pluggable parsers are supported.
 *
 * @param   {string} dir - directory to search for config files within
 * @param   {object} [parsers] - custom parsers to use to search and load config files with
 * @returns {object} - result merged config object
 */
function config(dir, parsers)
{
  var files, result = {};

  // by default use just `json` parser
  parsers = parsers || {json: JSON.parse};

  // get config files names suitable for the situation
  files = getFiles(process.env);

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
    , appInstance = env['NODE_APP_INSTANCE'] ? config.FILES['-'] + env['NODE_APP_INSTANCE'] : ''
    , hostname    = env['HOST'] || env['HOSTNAME'] || os.hostname() || ''
    , host        = hostname.split('.')[0]
    ;

  // populate files list in specific order
  addIfNotEmpty(files,
    config.FILES.default,
    config.FILES.default + appInstance);

  // environment specific config (bread and butter of the functionality)
  addIfNotEmpty(files,
    environment,
    environment + appInstance);

  // add host
  addIfNotEmpty(files,
    host,
    host + appInstance,
    host + config.FILES['-'] + environment,
    host + config.FILES['-'] + environment + appInstance);

  // and full hostname
  addIfNotEmpty(files,
    hostname,
    hostname + appInstance,
    hostname + config.FILES['-'] + environment,
    hostname + config.FILES['-'] + environment + appInstance);

  // local configuration
  addIfNotEmpty(files,
    config.FILES.local,
    config.FILES.local + appInstance,
    config.FILES.local + config.FILES['-'] + environment,
    config.FILES.local + config.FILES['-'] + environment + appInstance);

  // look for environment variables advanced mapping
  addIfNotEmpty(files,
    config.FILES.custom,
    config.FILES.custom + appInstance,
    config.FILES.custom + config.FILES['-'] + environment,
    config.FILES.custom + config.FILES['-'] + environment + appInstance);

  // it is backwards compatibility in the `config` module, but why not?
  addIfNotEmpty(files, config.FILES.runtime);

  return files;
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
