module.exports = isObject;

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
