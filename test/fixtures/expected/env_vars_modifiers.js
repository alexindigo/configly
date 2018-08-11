var date = new Date('Fri Aug 10 2018 10:01:56 GMT-0700');

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
    'without_env_as_string': '--EXPECT IT AS STRING--'
  }
};
