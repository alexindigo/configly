var merge = require('deeply');

// Public API
module.exports = mergeLayers;

/**
 * Merges provided layers into a single config object,
 * respecting order of the layers
 *
 * @param   {array} layers - list of config objects
 * @returns {object} - single config object
 */
function mergeLayers(layers)
{
  var _instance = this
    , result    = {}
    ;

  layers.forEach(function(layer)
  {
    layer.exts.forEach(function(ext)
    {
      ext.dirs.forEach(function(cfg)
      {
        // have customizable's array merge function
        result = merge.call({
          useCustomAdapters: merge.behaviors.useCustomAdapters,
          'array': _instance.arrayMerge
        }, result, cfg.config);
      });
    });
  });

  return result;
}
