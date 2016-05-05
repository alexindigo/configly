var merge       = require('deeply')
  // sub-modules
  , compare     = require('./compare.js')
  , parsers     = require('./parsers.js')
  // library files
  , configly    = require('./lib/configly.js')
  , load        = require('./lib/load.js')
  , envVars     = require('./lib/env_vars.js')
  , createNew   = require('./lib/create_new.js')
  ;

// singleton cache object
configly._cache            = {};

// expose helper functions
configly.new               = createNew;
configly.load              = load;
// internal helpers
configly.compareExtensions = compare.ascendingIgnoreCase;
configly.arrayMerge        = merge.adapters.array;

// defaults
configly.defaults = {
  directory    : './config',
  environment  : 'development',
  customEnvVars: 'custom-environment-variables'
};

// filename chunk separator
configly.separator = '-';

configly.parsers = parsers;

// post-processing hooks
// matched by the filename prefix
configly.hooks = {};
configly.hooks[configly.defaults.customEnvVars] = envVars;

// Public API
// return protected copy
module.exports = configly.new();
