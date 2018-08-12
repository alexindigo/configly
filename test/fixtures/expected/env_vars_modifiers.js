var date = new Date('Sat Aug 11 2018 10:01:56 GMT-0700');

module.exports = {
  'stuff': {
    'string'            : 'Hello world',
    'string_as_string'  : 'Hello world',

    'number'            : 345,
    'number_as_string'  : '345',

    'null'              : '--KEEP IT DEFAULT--',
    'null_as_string'    : '--KEEP IT DEFAULT AS STRING--',
    'null_no_modifiers' : 'null',

    'true'              : true,
    'true_as_string'    : 'true',

    'false'             : false,
    'false_as_string'   : 'false',

    'negative'          : -67,
    'negative_as_string': '-67',

    'zero': 0,
    'zero_as_string': '0',

    'date'              : date,
    'date_as_string'    : date.toString(),

    'without_env': '--EXPECT IT--',
    'without_env_as_string': '--EXPECT IT AS STRING--',

    'number_with_int': 15,
    'number_with_int_as_string': '15',

    'int': 15,
    'int_as_string': '15',

    'number_with_float': 1.5,
    'number_with_float_as_string': '1.5',

    'array': [25, 'boom', null, false],
    'array_as_string': '25,boom,,false', // <-- `null` didn't make the cut

    'object': {a: 1, b: 'two', c: true},
    'object_as_string': '[object Object]', // <-- Object Objectovich

    'boolean_true': true,
    'boolean_true_as_string': 'true',
    'boolean_false': false,
    'boolean_false_as_string': 'false',
    'boolean_zero': false,
    'boolean_zero_as_string': 'false',
    'boolean_one': true,
    'boolean_one_as_string': 'true',

    'bool_true': true,
    'bool_true_as_string': 'true',
    'bool_false': false,
    'bool_false_as_string': 'false',
    'bool_zero': false,
    'bool_zero_as_string': 'false',
    'bool_one': true,
    'bool_one_as_string': 'true'
  }
};
