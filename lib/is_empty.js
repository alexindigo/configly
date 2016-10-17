var notEmpty = require('./not_empty');

module.exports = isEmpty;

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
