# configly [![NPM Module](https://img.shields.io/npm/v/configly.svg?style=flat)](https://www.npmjs.com/package/configly)

A developer-friendly lightweight replacement for the `config` module that works with custom config directories, pluggable parsers and with many other handy features.

[![Linux Build](https://img.shields.io/travis/alexindigo/configly/master.svg?label=linux:6.x-12.x&style=flat)](https://travis-ci.org/alexindigo/configly)
[![MacOS Build](https://img.shields.io/travis/alexindigo/configly/master.svg?label=macos:6.x-12.x&style=flat)](https://travis-ci.org/alexindigo/configly)
[![Windows Build](https://img.shields.io/travis/alexindigo/configly/master.svg?label=windows:6.x-12.x&style=flat)](https://travis-ci.org/alexindigo/configly)

[![Coverage Status](https://img.shields.io/coveralls/alexindigo/configly/master.svg?label=code+coverage&style=flat)](https://coveralls.io/github/alexindigo/configly?branch=master)
[![Dependency Status](https://img.shields.io/david/alexindigo/configly.svg?style=flat)](https://david-dm.org/alexindigo/configly)

*Notice of change of ownership: Starting version 3.0.0 this package has changed it's owner and goals. The old version (2.0.3) is still available on npm via `npm install configly@2.0.3` and on [github.com/ksmithut/configly](https://github.com/ksmithut/configly). Thank you.*

## Install

```
$ yarn add configly
```

or

```
$ npm install --save configly
```


## Why

Original `config` module is convenient and easy to start with library, but in the same time being focused that much on "easy" it lacks certain features to be a _"developer friendly"_ library.

This package is addressing those issues, while keeping easy of use and feature set on par with the original module.

## Usage

### Basic

Configly provides rich configuration options, as well as set of sane (and battle-tested) defaults, which allow you to get a lot from basic setups.

To simply replace your current `config` setup, add following to your files:

```javascript
var config = require('configly');

console.log(config.my.combined.options);
```

It will load `.js` and `.json` files from `./config` folder,
relative to the current working directory (`process.cwd()`).

It will cache the result, so files will be read only once per process.

### Pluggable Formats and Parsers

Out of the box `configly` supports only two formats (`.js` and `.json`), but developers can add their own parsers and support for more formats (e.g. `.ini`, `.yaml`, `.cson`).

```javascript
var config     = require('configly/configure');
// more parsers
var ini        = require('ini');
// Note: recommended to use `cson-parser` over `cson`
// due to https://github.com/groupon/cson-parser/issues/56
// Update:
// recommended to use `cson` over `cson-parser`
// due to https://github.com/groupon/cson-parser/issues/74
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
    yaml      : function(str) { return yaml.safeLoad(str); },
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
    yaml      : function(str) { return yaml.safeLoad(str); },
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
var config = require('configly/configure')({directories: './etc'}); // `require('configly')('etc');` would work the same way
```

It will load files from the `etc` folder relative to the current working directory,
by providing absolute path, you can make sure exact location of the config files,
which is useful to libraries meant to be used within larger applications
and for command line apps that could be invoked from different directories.

```javascript
var path   = require('path');
var config = require('configly/configure')({directories: path.join(__dirname, 'etc')});
```

Or you can set up new directory as default one
and invoke `configly` without custom arguments
from within other files.

```javascript
// config.js
var path     = require('path');
var configly = require('configly/configure');

module.exports = configly.new({
  defaults: {
    directories: path.join(__dirname, 'etc')
  }
});

// app.js
var config = require('./config')();
```

### Additional Config Directories

It is possible to load files from more than one config directory within one application/module.

```javascript
var path     = require('path');
var configly = require('configly/configure');

// "inline"
var oneConfig = configly({directories: [
  path.join(__dirname, 'app-config'),
  path.join(__dirname, 'rules-config')
]});
```

Or creating new default

```javascript
module.exports = configly.new({
  defaults: {
    directories: [
      path.join(__dirname, 'app-config'),
      path.join(__dirname, 'rules-config')
    ]
  }
});
```

### Config Files Resolution Order

Configly scans config directory for number of config files, then loads and merges them in specific order.
It always starts with `default` file, as it's the place for all project's defaults, it will try load `default` with extensions for provided parsers (out of the box it will be `.js` and `.json`).
Then it will search for environment specific files, specified via `NODE_ENV` (in case it's omitted falls back to `development`). After that it searches for files related to the runtime's hostname. It closes off "static" config files with `local` file, which usually being git-ignored and meant for local overrides of the checked in configuration options.
After that configly proceeds to search for dynamic/meta config files – `custom-include-files` and `custom-environment-variables`...

Last file to read would be `runtime` file, and meant for deployment target local configuration rather than being checked into the code repository.

Example ordered list of files that will be read, in `NODE_ENV=production` environment on `dev382.corp.example.com` host:

```
default.js
default.json
default-production.js
default-production.json
production.js
production.json
dev382.js
dev382.json
dev382-production.js
dev382-production.json
dev382.corp.example.com.js
dev382.corp.example.com.json
dev382.corp.example.com-production.js
dev382.corp.example.com-production.json
local.js
local.json
local-production.js
local-production.json
custom-include-files.js
custom-include-files.json
custom-include-files-production.js
custom-include-files-production.json
custom-environment-variables.js
custom-environment-variables.json
custom-environment-variables-production.js
custom-environment-variables-production.json
runtime.js
runtime.json
runtime-production.js
runtime-production.json
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
var config = configly({
  directories: '/etc',
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
var config = configly({
  directories: path.join(__dirname, 'config'),
  // `configly` will search for `/etc/consul/env.js`, `/etc/consul/env.json`, etc
  // after loading default files from local `config` folder
  files: configly.files.concat('/etc/consul/env')
});
```

For bigger apps / more complex configs, combination of multiple directories
and custom files would provide needed functionality.

```javascript
var path     = require('path')
  , configly = require('configly/configure')
  , package  = require('./package.json')
  ;

module.exports = configly.new({
  defaults: {
    directories: [
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

### Custom Environment Variables

It allows to combine environment variables within a single entry (e.g. `"endpoint": "${REMOTE_HOST}:${REMOTE_PORT}"`), which helps to keep application config consumption simple and to the point, and gives greater control over different environments, like using Docker environment variables for linked containers.

`custom-environment-variables.json`:

```json
{
  "Customers":
  {
    "dbPassword"  :"ENV_VAR_NAME_AS_STRING",
    "dbPassword2" :"${ENV_VAR_NAME_VARIABLE}"
  },
  "CombinedWithText" : "${VARPART1}:${VARPART2}",
  "BothVarsEmptyWillBeSkippedCompletely" : "${NOEXISTING} + another ${EMPTY} var"
}
```

#### Modifiers

Since environment variables only passed as string, it creates inconvenience for handling non-string values, like boolean, falsy or complex values.

Modifiers will come handy to "pre-parse" values passed from the environment,
for example to pass `false` to your config or if some library requires casted parameters for number value.

`custom-environment-variables.json`:

```js
{
  "api":
  {
    "mocksEnabled"  :"json FETCH_MOCKS_ENABLED", // 'false' -> false
    "timeout" :"json FETCH_TIMEOUT", // '1500' -> 1500
    "cutOffDate" : "date DATE_CUTOFF", // '2018-08-08' -> new Date('2018-08-08')
    "nullSignal": "json PASSED_NULL" // 'null' -> null
  },
  "combinedBoolCastedToString" : "${json FETCH_MOCKS_ENABLED}", // 'false' -> false -> 'false'
  "combinedNumberCastedToString" : "${json FETCH_TIMEOUT}", // '1500' -> 1500 -> '1500'
  "combinedDateCastedToString" : "${date DATE_CUTOFF}", // '2018-08-08' -> new Date('2018-08-08') -> 'Tue Aug 07 2018 17:00:00 GMT-0700 (Pacific Daylight Time)'
  "combinedNullSignalSkip": "${json PASSED_NULL}", // 'null' -> null -> 'null'
  "nullNoModifierIsString": "PASSED_NULL", // 'null' -> 'null'
  "combinedNullNoModifierIsString": "${PASSED_NULL}" // 'null' -> 'null' -> 'null'
}
```


### Custom Include Files

For better integration with other configuration systems and third-party tools that generate configs, `configly` can "mount" custom config files into specified entries, for example if you need to pull webpack manifest files into app's config).

`custom-include-files.json`:

```json
{
  "MyModule": {
    "WillBeIgnored": "NONEXISTENT_FILE",
    "and": {
      "here": {
        "some": {
          "nested": {
            "structure": "custom_file"
          }
        }
      }
    }
  },
  "AnotherModule": {
    "yes": {
      "it": {
        "should": {
          "be": {
            "filename": {
              "no": {
                "extension": "../include_files/another_file"
              }
            }
          }
        }
      }
    }
  }
}
```

In the above example it will check for following custom files, (given `NODE_ENV` equals `production`):

- `custom_file.js`
- `custom_file.json`
- `custom_file-production.js`
- `custom_file-production.json`
- `../include_files/another_file.js`
- `../include_files/another_file.json`
- `../include_files/another_file-production.js`
- `../include_files/another_file-production.json`

And will attach their content to the respective branches.

### Custom Hooks

Developers can extend `configly`'s functionality with custom hooks for config files. For example if you need to pull in sensitive into your config and it couldn't be stored on disk among rest of the configuration data, you can add your own hooks to relace placeholders or attach extra values with data pull from the environment or from a secure storage. All hooks should be synchronous.

```javascript
var customHooks = merge(configly.hooks, {
  // will be applied to `local`, `local-development` and other `local*` files
  // expects `config` object of the parsed file
  local: function(config)
  {
    iterate(config, function(value, key, node)
    {
      // increments each value by 4
      node[key] = value + 4;
    });

    // expected to return updated object
    return config;
  }
});

var config = configly(configDir, {hooks: customHooks});
```

### Migration from `config`

To fully replicate `config`'s behavior and provide easy way to include static customized config
in your app files, without resorting to `require('../../../config')`, you can create virtual node module,
based on the custom config file within your app.

#### Step 1. Create config file that exports static config object (with your custom rules)

`config/config.js`

```javascript
var path     = require('path')
  , configly = require('configly/configure')
  , ini      = require('ini')
  , yaml     = require('js-yaml')
  ;

// run configly once with inlined modifiers
// and have it as node-cached module
module.exports = configly({
  defaults: {
    directories: [
      // will search local config directory
      './etc',
      // and augment with same files
      // from environment specific folder
      '/etc/consul'
    ]
  },
  // also will try to load config files matching current app name
  // e.g. `my-app.ini`, 'my-app.js', `my-app.json`, `my-app.yaml`,
  // `my-app-production.ini`, `my-app-production.js`, `my-app-production.json`, `my-app-production.yaml`,
  // from both local config folder and `/etc/consul`
  files: configly.files.concat('my-app'),

  // throw in custom parsers as well
  parsers: {
    ini  : ini.parse,
    // have it as a wrapper to prevent extra arguments leaking
    yaml : function(str) { return yaml.safeLoad(str); }
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

`app/lib/file.js`

```javascript
var config = require('config');

console.log('value', config.my.data.from.etc.consul.myApp.json);
```

### Base for Custom Module

And similar to the method described above, it could serve as a handy toolkit for your own config module,
below you can see simple example of the custom config module that allows for flexible extension on per project basis
while keeping standard approach within your organization.

```javascript
var path      = require('path')
  , configly  = require('configly/configure')
    // get application's name for per application custom config file,
    // useful for having per environment specific config files
    // separate from code base of the application
  , appName   = process.env['NODE_MY_ORG_CONFIG_APPNAME'] || require(path.resolve('./package.json')).name
    // by default, it will search local (CWD) `./config` directory
    // augmented with same files from environment specific folder `/etc/consul`,
    // and could overridden from outside of the app, for cases when app/module itself
    // being used as the base for another service, or in test/integration environments
  , directories = process.env['NODE_MY_ORG_CONFIG_PATH'] || './config:/etc/consul'
    // use standard path separator `:`
  , separator = ':'
  ;

// run configly once with inlined modifiers
// and have it as node-cached module
module.exports = configly({
  defaults: {
    directories: directories.split(separator)
  },
  // also will try to load config files matching current app name
  // e.g. 'my-app.js', `my-app.json`,
  // `my-app-production.js`, `my-app-production.json`,
  // from both local `config` folder and from `/etc/consul`.
  // Also `appName` could be composite value, like:
  // `my_app:my_group:my_org` for more flexibility
  files: configly.files.concat(appName.split(separator))
});
```

Above code could be published on npm (internal or public), as your organization specific config module `@myorg/config`,
and used within all your organization's projects:

```javascript
var config = require('@myorg/config');

console.log(config.env.specific.value);
```

### More Examples

For more examples check out [test directory](test/).

## Differences

Main differences between `configly` and `config`:

### Does

- Configly provides deterministic (and controllable) order of the config files it loads from.
- Configly provides deterministic (and controllable) order of the file extensions it loads from.
- Configly provides post-load hooks for config files, (e.g. `custom-environment-variables` and `custom-include-files` work via this mechanism).
- Configly provides ability to combine environment variables within one entry (e.g. `"endpoint": "${REMOTE_HOST}:${REMOTE_PORT}"`).
- Configly supports built-in and custom modifiers for environment variables overrides (e.g. `"loggingEnabled": "boolean LOGGING_ENABLED_BOOLEAN_AS_STRING"`)
- Configly provides ability to "mount" custom config files into specified entries (e.g. useful to pull webpack manifest files into app's config).
- Configly provides access to the underlying functions and defaults, allowing to utilize parts of the functionality for greater flexibility.

### Does Not

- Configly doesn't read/write `NODE_CONFIG` environment variable.
- Configly doesn't pollute your logs with warnings of non-existent files,
  it will either throw (if couldn't read/parse a file) or be silent.
- Configly doesn't provide `get`, `has` methods, it always returns pure js (POJO) object.
- Configly doesn't auto-strip comments from JSON files, instead use `parsers: {json: (str) => json5.parse(str)}`.

## License

Configly is released under the MIT license.
