// Public API
module.exports = getVar;

/**
 * Gets environment variable by provided name,
 * or return empty string if it doesn't exists
 *
 * @param   {string} name - variable name to search for
 * @param   {object} env - object to search within
 * @returns {string} - either variable if it exists or empty string
 */
function getVar(name, env)
{
  var result = '';

  if (typeof env[name] == 'string' && env[name].length > 0)
  {
    result = env[name];
  }

  return result;
}
