var path        = require('path')
  , fs          = require('fs')
  , typeOf      = require('precise-typeof')
  , stripBOM    = require('stripbom')
  , applyHooks  = require('./apply_hooks.js')
  , resolveExts = require('./resolve_exts.js')
  ;

// Public API
module.exports = loadFiles;

/**
 * Loads and parses config from available files
 *
 * @param   {array|string} directories - directories to search in
 * @param   {array} files - list of files to search for
 * @returns {array} - list of loaded configs in order of provided files
 */
function loadFiles(directories, files)
{
  // sort extensions to provide deterministic order of loading
  var _instance  = this
    , extensions = resolveExts.call(this)
    , layers     = []
    ;

  // treat all inputs as list of directories
  directories = (typeOf(directories) == 'array') ? directories : [directories];

  files.forEach(function(filename)
  {
    var layer = {file: filename, exts: []};

    extensions.forEach(function(ext)
    {
      var layerExt = {ext: ext, dirs: []};

      directories.forEach(function(dir)
      {
        var cfg, file = path.resolve(dir, filename + '.' + ext);

        if (fs.existsSync(file))
        {
          cfg = loadContent.call(_instance, file, _instance.parsers[ext]);

          // check if any hooks needed to be applied
          cfg = applyHooks.call(_instance, cfg, filename);
        }

        if (cfg)
        {
          layerExt.dirs.push({
            dir   : dir,
            config: cfg
          });
        }
      });

      // populate with non-empty layers only
      if (layerExt.dirs.length)
      {
        layer.exts.push(layerExt);
      }
    });

    // populate with non-empty layers only
    if (layer.exts.length)
    {
      layers.push(layer);
    }

  });

  return layers;
}

/**
 * Loads and parses provided file (synchronous).
 *
 * @param   {string} file - absolute path to the file
 * @param   {function} parser - function to parse provided content and return config object
 * @returns {object} - parsed config object
 */
function loadContent(file, parser)
{
  var content, config;

  try
  {
    content = stripBOM(fs.readFileSync(file, {encoding: 'utf8'}));
    // provide file path as the second argument for complex parsing,
    // also it matches `module._compile` nodejs API.
    // Note: JSON.parse accepts two arguments, but ignores anything
    // but function on the second place, so it's safe to pass a filename
    // Other parsers might need to have wrappers.
    config = parser(content, file);
  }
  catch (e)
  {
    throw new Error('Config file ' + file + ' cannot be read or malformed.');
  }

  return config;
}
