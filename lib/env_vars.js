var getVar      = require('./get_var.js')
  , isObject    = require('./is_object.js')
  , hasValue    = require('./has_value.js')
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
      value = getVar.call(this, config[key], process.env);

      // if not, try parsing for variables
      if (!hasValue(value))
      {
        value = parseTokens.call(this, config[key], process.env);
      }

      // keep the entry if something's been resolved
      // empty or unchanged value signal otherwise
      if (hasValue(value))
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
      envVars.call(this, config[key], backRef.concat(key));
    }
    // Unsupported entry type
    else
    {
      throw new Error('Illegal key type for custom-environment-variables at ' + backRef.concat(key).join('.') + ': ' + Object.prototype.toString.call(config[key]));
    }
  }.bind(this));

  return config;
}
