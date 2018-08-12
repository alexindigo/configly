var typeOf = require('precise-typeof');

// by default use just `date`, `json` modifiers
module.exports = {
  // relies on built-in JSON.parse
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  json: json,

  // relies on built-in Date.parse
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
  date: date,

  // relies on built-in Number.parseInt
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseInt
  number: number,
  // use `int` as an alias to number
  int: number,

  // relies on built-in Number.parseFloat
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat
  float: float,

  // makes sure only arrays go through
  array: array,

  // makes sure only objects go through
  object: object,

  // makes sure on boolean go through
  boolean: boolean,
  // use `bool` as an alias to boolean
  bool: boolean
};

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
 * Parses provided string as a Date string
 *
 * @param   {string} value - Date string to parse
 * @returns {Date} - Date object representaion of the provided string
 */
function date(value) {
  var parsedDate = Date.parse(value);

  // couldn't parse it
  if (typeOf(parsedDate) != 'number') {
    return throwModifierError('date', value, {message: 'Invalid Date'});
  }

  return new Date(parsedDate);
}

/**
 * Parses provided string as a Number (Int)
 *
 * @param   {string} value - string to parse
 * @returns {number} - Parsed integer number
 */
function number(value) {
  var parsedNumber = Number.parseInt(value, 10);

  // couldn't parse it
  if (typeOf(parsedNumber) != 'number') {
    return throwModifierError('number', value, {message: 'Invalid Number'});
  }

  return parsedNumber;
}

/**
 * Parses provided string as Float
 *
 * @param   {string} value - string to parse
 * @returns {float} - Parsed float number
 */
function float(value) {
  var parsedFloat = Number.parseFloat(value);

  // couldn't parse it
  if (typeOf(parsedFloat) != 'number') {
    return throwModifierError('float', value, {message: 'Invalid Float'});
  }

  return parsedFloat;
}

/**
 * Parses provided string as an array (json + array validation)
 *
 * @param   {string} value - string to parse
 * @returns {array} - Parsed array
 */
function array(value) {
  var parsedArray = json(value);

  // couldn't parse it
  if (typeOf(parsedArray) != 'array') {
    return throwModifierError('array', value, {message: 'Invalid Array'});
  }

  return parsedArray;
}

/**
 * Parses provided string as an object (json + object validation)
 *
 * @param   {string} value - string to parse
 * @returns {object} - Parsed object
 */
function object(value) {
  var parsedObject = json(value);

  // couldn't parse it
  if (typeOf(parsedObject) != 'object') {
    return throwModifierError('object', value, {message: 'Invalid Object'});
  }

  return parsedObject;
}

/**
 * Parses provided string as a boolean (json + boolean validation)
 *
 * @param   {string} value - string to parse
 * @returns {boolean} - Parsed boolean
 */
function boolean(value) {
  var parsedBoolean = json(value);

  // handle 0|1 case
  if (typeOf(parsedBoolean) == 'number' && [0, 1].indexOf(parsedBoolean) > -1) {
    parsedBoolean = parsedBoolean === 0 ? false : true;
  }

  // couldn't parse it
  if (typeOf(parsedBoolean) != 'boolean') {
    return throwModifierError('boolean', value, {message: 'Invalid Boolean'});
  }

  return parsedBoolean;
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
