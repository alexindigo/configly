var getVar   = require('./get_var.js')
  , hasValue = require('./has_value.js')
  ;

// Public API
module.exports = parseTokens;

/**
 * Parses provided config entry
 * to find variable placeholders
 * and replace them with values
 *
 * @param   {string} entry - string to parse
 * @param   {object} env - object to search within
 * @returns {string|boolean} - replaced string or empty string
 *                              if no matching variables found
 */
function parseTokens(entry, env)
{
  var found = 0;

  if (entry.indexOf('${') > -1)
  {
    entry = entry.replace(/\$\{([^}]+)\}/g, function(match, token)
    {
      var value = getVar.call(this, token, env);

      // need to have `found` counter
      // to see if any of the variables
      // in the string were resolved
      if (hasValue(value))
      {
        found++;
      }

      return value;
    }.bind(this));
  }

  // reset entry if no variables were resolved
  if (!found) entry = '';

  return entry;
}
