// Public API
module.exports = notEmpty;

/**
 * Checks if string is not empty
 *
 * @param   {string} str - string to check
 * @returns {boolean} - true is string is not empty, false otherwise
 */
function notEmpty(str)
{
  return (str != null && str.toString().length > 0);
}
