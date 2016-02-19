// Public API
module.exports = customEnvironmentVariablesHook;

/**
 * Replaces object's elements with corresponding environment variables, if defined
 *
 * @param   {object} config - config object to process
 * @param   {array} [backRef] - back reference to the parent element
 * @returns {object} - resolved object
 */
function customEnvironmentVariablesHook(config, backRef)
{
  backRef = backRef || [];

  Object.keys(config).forEach(function(key)
  {
    var found = 0;

    if (typeof config[key] == 'string')
    {
      // try simple match first, for non-empty value
      if (typeof process.env[config[key]] == 'string' && process.env[config[key]].length > 0)
      {
        config[key] = process.env[config[key]];
      }
      // try parsing for variables
      else if (config[key].indexOf('${') > -1)
      {
        config[key] = config[key].replace(/\$\{([^}]+)\}/g, function(token, name)
        {
          var result = '';

          if (typeof process.env[name] == 'string' && process.env[name].length > 0)
          {
            result = process.env[name];
            found++;
          }

          return result;
        });

        if (!found)
        {
          delete config[key];
        }
      }
      // or remove the entry
      else
      {
        delete config[key];
      }
    }
    else if (isObject(config[key]))
    {
      customEnvironmentVariablesHook(config[key], backRef.concat(key));
    }
    // Unsupported entry type
    else
    {
      throw new Error('Illegal key type for custom-environment-variables at ' + backRef.concat(key).join('.') + ': ' + typeof value);
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
