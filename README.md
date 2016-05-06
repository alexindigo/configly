# configly [![NPM Module](https://img.shields.io/npm/v/configly.svg?style=flat)](https://www.npmjs.com/package/configly)

A developer-friendly lightweight replacement for the `config` module that works with custom config directory and pluggable parsers.

[![Linux Build](https://img.shields.io/travis/alexindigo/configly/master.svg?label=linux:0.10-6.x&style=flat)](https://travis-ci.org/alexindigo/configly)
[![Windows Build](https://img.shields.io/appveyor/ci/alexindigo/configly/master.svg?label=windows:0.10-6.x&style=flat)](https://ci.appveyor.com/project/alexindigo/configly)

[![Coverage Status](https://img.shields.io/coveralls/alexindigo/configly/master.svg?label=code+coverage&style=flat)](https://coveralls.io/github/alexindigo/configly?branch=master)
[![Dependency Status](https://img.shields.io/david/alexindigo/configly.svg?style=flat)](https://david-dm.org/alexindigo/configly)

[![bitHound Overall Score](https://www.bithound.io/github/alexindigo/configly/badges/score.svg)](https://www.bithound.io/github/alexindigo/configly)

*Notice of change of ownership: Starting version 3.0.0 this package has changed it's owner and goals. The old version (2.0.3) is still available on npm via `npm install configly@2.0.3` and on [github.com/ksmithut/configly](https://github.com/ksmithut/configly). Thank you.*

## Install

```
$ npm install --save configly
```

## Why

Original `config` module is convenient and easy to start with library, but in the same time being focused that much on "easy" it lacks certain features to be a _"developer friendly"_ library.

This package is addressing those issues, while keeping easy of use and feature set on par with the original module.

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

var configObj = config({
  parsers: {
    ini       : ini.parse,
    // have it as a wrapper to prevent extra arguments leaking
    cson      : function(str) { return cson.parse(str); },
    yml       : function(str) { return yaml.safeLoad(str); },
    // same options as used within `config` module
    properties: function(str) { return properties.parse(str, {namespaces: true, variables: true, sections: true}); },
    // use json5 instead of `JSON.parse`
    json      : json5.parse,
    // keep the original one
    js        : config.parsers.js
  }
});
```

Or create new instance with new defaults

```javascript

var configNew = config.new({
  parsers: {
    ini       : ini.parse,
    // have it as a wrapper to prevent extra arguments leaking
    cson      : function(str) { return cson.parse(str); },
    yml       : function(str) { return yaml.safeLoad(str); },
    // same options as used within `config` module
    properties: function(str) { return properties.parse(str, {namespaces: true, variables: true, sections: true}); },
    // use json5 instead of `JSON.parse`
    json      : json5.parse,
    // keep the original one
    js        : config.parsers.js
  }
});

// use it as usual
var configObj = configNew();

```

You can export newly created instance and reuse it all over your app,
it won't be affected by other instances of the `configly` even if it
used in dependencies of your app, or you module is part of the bigger app,
that uses `configly`.

### Custom Config Directory

To load config files from a custom directory, just specify it as the first argument.

```javascript
var config = require('configly')('./etc'); // `require('configly')('etc');` would work the same way
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
// config.js
var path     = require('path');
var configly = require('configly');

module.exports = configly.new({
  defaults: {
    directory: path.join(__dirname, 'etc')
  }
});

// app.js
var config = require('./config')();
```

### Additional Config Directories

It is possible to load files from more than one config directory within one application/module.

```javascript
var path     = require('path');
var ini      = require('ini');
var configly = require('configly');

// "inline"
var oneConfig = configly([
  path.join(__dirname, 'app-config'),
  path.join(__dirname, 'rules-config')
]);
```

Or creating new default

```javascript
module.exports = configly.new({
  defaults: {
    directory: [
      path.join(__dirname, 'app-config'),
      path.join(__dirname, 'rules-config')
    ]
  }
});
```

### Custom Files

Also `configly` can load config data from custom files (along with the [default list](lib/create_new.js#L105)),
handling them the same way – search for supported extensions and within specified directory(-ies).

```javascript
var config = configly({
  files: configly.files.concat(['custom_file_A', 'custom_file_B'])
});
```

Following code will completely replace list of filenames.

```javascript
var config = configly('/etc', {
  files: [
    'totally',
    'custom',
    'list',
    'of',
    'files'
  ]
});
```

For use cases where you need to load config files within the app,
but augment it with server/environment specific config
you can add absolute path filename to the files list.

```javascript
var config = configly(path.join(__dirname, 'config'), {
  // `configly` will search for `/etc/consul/env.js`, `/etc/consul/env.json`, etc
  // after loading default files from local `config` folder
  files: configly.files.concat('/etc/consul/env')
});
```

For bigger apps / more complex configs, combination of multiple directories
and custom files would provide needed functionality.

```javascript
var path     = require('path')
  , configly = require('configly')
  , package  = require('./package.json')
  ;

module.exports = configly.new({
  defaults: {
    directory: [
      // will search local config directory
      path.join(__dirname, 'config'),
      // and augment with same files
      // from environment specific folder
      '/etc/consul'
    ]
  },
  // also will try to load config files matching current app name
  // e.g. 'my-app.js', `my-app.json`, `my-app-production.js`, `my-app-production.json`,
  // from both local config folder and `/etc/consul`
  files: configly.files.concat(package.name)
});
```

### Migration From `config`

To fully replicate `config`'s behavior and provide easy way to include static customized config
in your app files, without resorting to `require('../../../config')`, you can create virtual node module,
based on the custom config file within your app.

#### Step 1. Create config file that exports static config object (with your custom rules)

`config/config.js`

```javascript
var path     = require('path')
  , configly = require('configly')
  , ini      = require('ini')
  , yaml     = require('js-yaml')
  ;

// run configly once with inlined modifiers
// and have it as node-cached module
module.exports = configly({
  defaults: {
    directory: [
      // will search local config directory
      './etc',
      // and augment with same files
      // from environment specific folder
      '/etc/consul'
    ]
  },
  // also will try to load config files matching current app name
  // e.g. `my-app.ini`, 'my-app.js', `my-app.json`, `my-app.yml`,
  // `my-app-production.ini`, `my-app-production.js`, `my-app-production.json`, `my-app-production.yml`,
  // from both local config folder and `/etc/consul`
  files: configly.files.concat('my-app'),

  // throw in custom parsers as well
  parsers: {
    ini : ini.parse,
    // have it as a wrapper to prevent extra arguments leaking
    yml : function(str) { return yaml.safeLoad(str); }
  }
});
```

#### Step 2. Add `package.json` for your virtual node module

`config/package.json`

```json
{
  "name": "config",
  "version": "0.0.0",
  "main": "config.js"
}
```

#### Step 3. Add virtual node module to your app's `package.json`

```json
  "dependencies": {
    "config": "./config"
  },
```

Now npm will copy `./config/` files into `node_modules` and execute `./config/config.js` on first require,
making it's output available for every file of your app, via `var config = require('config')`.

This way migration of your app from `config` module to `configly` will be limited to a few extra lines of code,
while providing more functionality and better separation of concerns out of the box.

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
- Configly doesn't provide `get`, `has` methods, it always returns pure js (POJO) object.
- Configly doesn't auto-strip comments from JSON files, use `configly.PARSERS['json'] = json5.parse;`.


## License

Configly is licensed under the MIT license.
