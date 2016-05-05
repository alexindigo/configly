var notEmpty    = require('./not_empty.js')
  , parseTokens = require('./parse_tokens.js')
  ;

// Public API
module.exports = getFiles;

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
    , environment = env['NODE_ENV'] || this.defaults.environment
    , appInstance = env['NODE_APP_INSTANCE']
    ;

  // generate config files variations
  this.files.forEach(function(baseName)
  {
    // check for variables
    // keep baseName if no variables found
    baseName = parseTokens(baseName, env) || baseName;

    // add base name with available suffixes
    addWithSuffixes.call(this, files, baseName, appInstance);
    addWithSuffixes.call(this, files, baseName, environment, appInstance);
  }.bind(this));

  return files;
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
      baseName += (baseName ? this.separator : '') + suffix;
      pushUniquely(list, baseName);
    }
  }.bind(this));
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
