var getVar      = require('./get_var.js')
  , notEmpty    = require('./not_empty.js')
  , parseTokens = require('./parse_tokens.js')
  ;

// Public API
module.exports = envVars;

/**
 * Replaces object's elements with corresponding environment variables, if defined
 *
 * @param   {object} config - config object to process
 * @param   {array} [backRef] - back reference to the parent element
 * @returns {object} - resolved object
 */
function envVars(config, backRef)
{
  backRef = backRef || [];

  Object.keys(config).forEach(function(key)
  {
    var value;

    if (typeof config[key] == 'string')
    {
      // try simple match first, for non-empty value
      value = getVar(config[key], process.env);

      // if not, try parsing for variables
      if (isEmpty(value))
      {
        value = parseTokens(config[key], process.env);
      }

      // keep the entry if something's been resolved
      // empty or unchanged value signal otherwise
      if (notEmpty(value) && value !== config[key])
      {
        config[key] = value;
      }
      else
      {
        delete config[key];
      }
    }
    else if (isObject(config[key]))
    {
      envVars(config[key], backRef.concat(key));
    }
    // Unsupported entry type
    else
    {
      throw new Error('Illegal key type for custom-environment-variables at ' + backRef.concat(key).join('.') + ': ' + Object.prototype.toString.call(config[key]));
    }
  });

  return config;
}

/**
 * Check if provided variable is really an object
 *
 * @param   {mixed} obj - variable to check
 * @returns {boolean} true if variable is real object, false otherwise
 */
function isObject(obj)
{
  return (obj !== null) && (typeof obj == 'object') && !(Array.isArray(obj));
}

/**
 * Shortcut for positive checks
 *
 * @param   {string} str - string to check
 * @returns {boolean} - true is string is empty, false otherwise
 */
function isEmpty(str)
{
  return !notEmpty(str);
}
