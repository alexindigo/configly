var configly = require('../configure');

// run configly once with inlined modifiers
// and have it as node-cached module
var config = configly({ directories: './fixtures/config/basic' });

module.exports = config;
