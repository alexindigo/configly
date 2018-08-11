var typeOf = require('precise-typeof');

// Public API
module.exports = getVar;

/**
 * Gets environment variable by provided name,
 * or return empty string if it doesn't exists
 *
 * @param   {string} token - variable token (name + modifiers) to process
 * @param   {object} env - object to search within
 * @returns {string} - either variable if it exists or empty string
 */
function getVar(token, env)
{
  var modifiers = token.split(/\s+/)
    , name      = modifiers.pop()
    , result    = ''
    ;

  if (typeof env[name] == 'string' && env[name].length > 0)
  {
    result = env[name];

    // process value with modifiers, right to left
    result = modifiers.reverse().reduce(function(accumulatedValue, modifierName)
    {
      if (typeOf(this.modifiers[modifierName]) != 'function') {
        throw new Error('Unable to find requested modifier `' + modifierName + '` among available modifiers: [' + Object.keys(this.modifiers).join('], [') + '].');
      }
      return this.modifiers[modifierName](accumulatedValue);
    }.bind(this), result);
  }

  return result;
}
