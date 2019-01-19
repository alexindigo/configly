var test     = require('tape');
var configly = require('../configure');

var expected = {
  Customers: {
    dbName: 'from_default_json',
    dbPassword: 'password will be overwritten.',
    dbPassword2: 'password will be overwritten.',
    lang: ['en', 'es']
  },
  AnotherModule: {
    parm1: 'value2'
  },
  staticArray: [4, 5, 6],
  Inline: {
    a: '',
    b: '1'
  },
  ContainsQuote: '"this has a quote"',
  MoreComplexQuote: '<a href="http://localhost:3000/offers/reply?id=${{system.contact.value}}">Test String</a>'
};

// directories path is relative to `pwd`
var config = configly({ directories: './test/fixtures/config/basic' });

module.exports = config;

test('basic', function(t)
{
  t.plan(1);
  t.deepLooseEqual(config, expected, 'expects to get proper config object from bundled configly');
});
