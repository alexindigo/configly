// Public API
module.exports = notEmpty;

/**
 * Checks if string is not empty
 *
 * @param   {mixed} value - string to check
 * @returns {boolean} - true is string is not empty, false otherwise
 */
function notEmpty(value)
{
  return (value != null && value.toString().length > 0);
}
