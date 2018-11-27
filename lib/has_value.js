var typeOf = require('precise-typeof');

// Public API
module.exports = hasValue;

/**
 * Checks if provided variable has value,
 * consider empty only if it's a string and has zero length, or it's NaN,
 * or it's `undefined` value, everything else consider a legit value
 *
 * @param   {mixed} value - string to check
 * @returns {boolean} - true is string is not empty, false otherwise
 */
function hasValue(value)
{
  if (typeOf(value) === 'string') {
    return value.length > 0;
  } else {
    return typeOf(value) !== 'undefined' && typeOf(value) !== 'nan';
  }
}
