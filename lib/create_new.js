var os            = require('os')
  , cloneFunction = require('fulcon')
  , merge         = require('deeply')
  , configly      = require('./configly.js')
  ;

// Public API
module.exports = createNew;

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
  applyProps.call(this, copy, options);

  // get fresh list of filenames
  // if needed
  copy.files = copy.files || getFilenames.call(copy);

  // expose public methods on the outside
  // mind baked in context of the copies
  copyProps.call(copy, instance);

  return instance;
}

/**
 * Applies properties from the source function onto target one
 *
 * @param   {function} target - function to enrich
 * @param   {object} [options] - custom props to overload with
 * @returns {function} enriched target
 */
function applyProps(target, options)
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
function copyProps(target)
{
  Object.keys(this).forEach(function(key)
  {
    target[key] = typeof this[key] == 'function' ? this[key].bind(this) : this[key];
  }.bind(this));

  return target;
}

/**
 * Detects hostname based on the environment
 *
 * @returns {string} - hostname or empty string
 */
function getHostname()
{
  return process.env['HOST'] || process.env['HOSTNAME'] || os.hostname() || '';
}

/**
 * Creates list of filenames to search with
 *
 * @returns {array} - list of the filenames
 */
function getFilenames()
{
  var hostname = getHostname()
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
