# configly [![NPM Module](https://img.shields.io/npm/v/configly.svg?style=flat)](https://www.npmjs.com/package/configly)

A developer-friendly lightweight replacement for the `config` module that works with custom config directory and pluggable parsers.

[![Linux Build](https://img.shields.io/travis/alexindigo/configly/master.svg?label=linux:0.10-5.x&style=flat)](https://travis-ci.org/alexindigo/configly)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/configly/master.svg?label=windows:0.10-5.x&style=flat)](https://ci.appveyor.com/project/alexindigo/configly)

[![Coverage Status](https://img.shields.io/coveralls/alexindigo/configly/master.svg?label=code+coverage&style=flat)](https://coveralls.io/github/alexindigo/configly?branch=master)
[![Dependency Status](https://img.shields.io/david/alexindigo/configly.svg?style=flat)](https://david-dm.org/alexindigo/configly)

*Notice of change of ownership: Starting version 3.0.0 this package has changed it's owner and goals. The old version (2.0.3) is still available on npm via `npm install configly@2.0.3` and on [github.com/ksmithut/configly](https://github.com/ksmithut/configly). Thank you.*

## Install

```
$ npm install --save configly
```

## Why

Original `config` module is convenient and easy to start with library, but in the same time being focused that much on "easy" it lacks certain features to be a _"developer friendly"_ library.

This package is addressing those issues, while keeping easy of use and featureset on par with the original module.

## Usage

### Basic

To simply replace your current `config` setup, add following to your files:

```javascript
var config = require('configly')();

console.log(config.my.combined.options);
```

It will load `.js` and `.json` files from `./config` folder,
relative to the current working directory (`process.cwd()`).

It will cache the result, so files will be read only once per process.

### Pluggable Formats and Parsers

Out of the box `configly` supports only two formats (`.js` and `.json`), but developers can add their own parsers and support for more formats (e.g. `.ini`, `.yaml`, `.cson`).

```javascript
var config     = require('configly');
// more parsers
var ini        = require('ini');
var cson       = require('cson');
var yaml       = require('js-yaml');
var properties = require('properties');
var json5      = require('json5');

// assemble new parsers list
// order doesn't matter since they
// will be alphabetically sorted
config.PARSERS = {
  ini       : ini.parse,
  // have it as a wrapper to prevent extra arguments leaking
  cson      : function(str) { return cson.parse(str); },
  yml       : function(str) { return yaml.safeLoad(str); },
  // same options as used within `config` module
  properties: function(str) { return properties.parse(str, {namespaces: true, variables: true, sections: true}); },
  // use json5 instead of `JSON.parse`
  json      : json5.parse
  // keep the original one
  js        : config.PARSERS.js,
};

var configObj = config();
```

Since `configly` is a singleton, this setup could be done in your index file,
and the rest of the files would use it the same way as in the "Basic" example.

### Custom Config Directory

To load config files from a custom directory, just specify it as the first argument.

```javascript
var config = require('configly')('./etc'); // `require('configly')('./etc');` would work the same way`
```

It will load files from the `etc` folder relative to the current working directory,
by providing absolute path, you can make sure exact location of the config files,
which is useful to libraries meant to be used within larger applications
and for command line apps that could be invoked from different directories.

```javascript
var path   = require('path');
var config = require('configly')(path.join(__dirname, 'etc'));
```

Or you can set up new directory as default one
and invoke `configly` without custom arguments
from within other files.

```javascript
// index.js
var path     = require('path');
var configly = require('configly');

configly.DEFAULTS.directory = path.join(__dirname, 'etc');

// app.js
var config = require('configly')();
```

### Additional Config Directories

It is possible to load files from more than one config directory within one application/module.

```javascript
var path     = require('path');
var ini      = require('ini');
var configly = require('configly');

var appConfig   = configly(path.join(__dirname, 'app-config'));
// for example you have .ini config files there
var rulesConfig = configly(path.join(__dirname, 'rules-config'), {ini: ini.parse});
```

If there is a need to merge standalone config objects into one,
you can use `configly.merge` method manually,
in the order that suites your specific use case.

```javascript
var oneConfig = configly.merge(appConfig, rulesConfig);
```

### More Examples

For more examples check out [test directory](test/).

## Differences

Main differences between `configly` and `config`:

### Does

- Configly provides deterministic (and controllable) order of the config files it loads from.
- Configly provides deterministic (and controllable) order of the file extensions it loads from.
- Configly provides post-load hooks for config files, (e.g. `custom-environment-variables` works via this mechanism).
- Configly provides ability to combine environment variables within one entry (e.g. `"endpoint": "${REMOTE_HOST}:${REMOTE_PORT}"`).
- Configly provides access to the underlying functions and defaults, allowing to utilize parts of the functionality for greater flexibility.

### Does Not

- Configly doesn't read/write `NODE_CONFIG` environment variable.
- Configly doesn't pollute your logs with warnings of non-existent files,
  it will either throw (if couldn't read/parse a file) or be silent.
- Configly doesn't provide `get`, `has` methods, it returns pure js object.
- Configly doesn't auto-strip comments from JSON files, use `configly.PARSERS['json'] = json5.parse;`.


## License

Configly is licensed under the MIT license.
