// by default use just `date`, `json` modifiers
module.exports = {
  date: date,
  json: json
};

/**
 * Parses provided string as a Date string
 *
 * @param   {string} value - Date string to parse
 * @returns {Date} - Date object representaion of the provided string
 */
function date(value) {
  var parsedDate;

  try {
    parsedDate = new Date(value);
  } catch(e) {
    return throwModifierError('date', value, e);
  }

  // or if it didn't throw
  if (parsedDate.toString() == 'Invalid Date') {
    return throwModifierError('date', value, {message: parsedDate.toString()});
  }

  return parsedDate;
}

/**
 * Parses provided string as JSON string
 *
 * @param   {string} value - Date string to parse
 * @returns {object} - Parsed JSON POJO
 */
function json(value) {
  var parsedPojo;

  try {
    parsedPojo = JSON.parse(value);
  } catch(e) {
    return throwModifierError('date', value, e);
  }

  return parsedPojo;
}

/**
 * Throws modifiers errors in a centralized way
 *
 * @param   {string} modifier - Modifier name
 * @param   {mixed} value - Attempted to parse value
 * @param   {object} [exception] - Corresponding exception, if provided
 */
function throwModifierError(modifier, value, exception) {
  throw new Error('Unable to parse provided value `' + value + '` with `' + modifier + '` modifier.' + (exception ?  ' Exception: ' + exception.message : ''));
}
