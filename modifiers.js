// by default use just `date`, `json` modifiers
module.exports = {
  // relies on built-in date parsing
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
  date: date,

  // relies on built-in json parsing
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  json: json
};

/**
 * Parses provided string as a Date string
 *
 * @param   {string} value - Date string to parse
 * @returns {Date} - Date object representaion of the provided string
 */
function date(value) {
  var parsedDate = Date.parse(value);

  // couldn't parse it
  if (isNaN(parsedDate)) {
    return throwModifierError('date', value, {message: 'Invalid Date'});
  }

  return new Date(parsedDate);
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
    return throwModifierError('json', value, e);
  }

  return parsedPojo;
}

/**
 * Throws modifiers errors in a centralized way
 *
 * @param   {string} modifier - Modifier name
 * @param   {mixed} value - Attempted to parse value
 * @param   {object} exception - Corresponding exception, if provided
 */
function throwModifierError(modifier, value, exception) {
  throw new Error('Unable to parse provided value `' + value + '` with `' + modifier + '` modifier. Exception: ' + exception.message);
}
