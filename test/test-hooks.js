var testName  = 'hooks';
var test      = require('tape');
var path      = require('path');
var merge     = require('deeply');
var configly  = require('../configure');
var expected  = require('./fixtures/expected/' + testName + '.json');
var configDir = path.join(__dirname, 'fixtures/config/' + testName);

test('custom hooks', function(t)
{
  t.plan(1);

  var configObj
    , customHooks = merge(configly.hooks,
      {
        // it will be ignored, since won't match any file
        nomatch: function()
        {
          throw new Error('What am I doing here?');
        },
        zomatch: function()
        {
          throw new Error('Should no be called either');
        },

        // will be applied to `default` file only
        // expects `config` object of the parsed file
        default: function(config)
        {
          iterate(config, function(value, key, node)
          {
            // increments each value by 3
            node[key] = value + 3;
          });

          // expected to return updated object
          return config;
        },

        // will be applied to both `local` and `local-development` files
        // expects `config` object of the parsed file
        local: function(config)
        {
          iterate(config, function(value, key, node)
          {
            // multiplies each value by 2
            node[key] = value * 2;
          });

          // expected to return updated object
          return config;
        },

        // will be applied to `local-development` file only
        // expects `config` object of the parsed file
        'local-development': function(config)
        {
          iterate(config, function(value, key, node)
          {
            // increments each value by 5
            node[key] = value + 5;
          });

          // expected to return updated object
          return config;
        }

      })
    ;

  process.env['NODE_ENV']  = 'development';

  configObj = configly({directories: configDir, hooks: customHooks});
  t.deepLooseEqual(configObj, expected, 'expects to get proper config object');
});

/**
 * Iterates two levels deep
 *
 * @param   {object} config - config object to iterate over
 * @param   {function} iterator - invoked with each config value
 */
function iterate(config, iterator)
{
  Object.keys(config).forEach(function(key)
  {
    Object.keys(config[key]).forEach(function(subkey)
    {
      iterator(config[key][subkey], subkey, config[key]);
    });
  });
}
