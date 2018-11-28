var deeply       = require('deeply')
  , typeOf       = require('precise-typeof')
  // sub-modules
  , compare      = require('./compare.js')
  , parsers      = require('./parsers.js')
  , modifiers    = require('./modifiers.js')
  // library files
  , configly     = require('./lib/configly.js')
  , load         = require('./lib/load.js')
  , envVars      = require('./lib/env_vars.js')
  , includeFiles = require('./lib/include_files.js')
  , createNew    = require('./lib/create_new.js')
  ;

// singleton cache object
configly._cache            = {};

// expose helper functions
configly.new               = createNew;
configly.load              = load;
// internal helpers
configly.compareExtensions = compare.ascendingIgnoreCase;
configly.arrayMerge        = deeply.adapters.array;
configly.mergeTypeOf       = function(input) { return typeOf(input, {pojoOnly: true}); };

// defaults
configly.defaults = {
  directories       : './config',
  environment       : 'development',
  customEnvVars     : 'custom-environment-variables',
  customIncludeFiles: 'custom-include-files'
};

// no specific directories set (yet)
// fallback to the default one
configly.directories = null;

// filename chunk separator
configly.separator = '-';

configly.parsers = parsers;
configly.modifiers = modifiers;

// post-processing hooks
// matched by the filename prefix
configly.hooks = {};
configly.hooks[configly.defaults.customEnvVars] = envVars;
configly.hooks[configly.defaults.customIncludeFiles] = includeFiles;

// Public API
// return protected copy
module.exports = configly.new();
