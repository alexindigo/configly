var merge    = require('deeply')
  , isEmpty  = require('./is_empty.js')
  , isObject = require('./is_object.js')
  , cloneFunction =
  {
    useCustomAdapters: merge.behaviors.useCustomAdapters,
    'function'       : merge.adapters.functionsClone
  }
  ;

// Public API
module.exports = includeFiles;

/**
 * Replaces object's elements with content of corresponding files, if exist
 *
 * @param   {object} config - config object to process
 * @param   {array} [backRef] - back reference to the parent element
 * @returns {object} - resolved object
 */
function includeFiles(config, backRef)
{
  backRef = backRef || [];

  Object.keys(config).forEach(function(key)
  {
    var value, oneOffContext;

    if (typeof config[key] == 'string')
    {
      // create temp context
      oneOffContext = merge.call(cloneFunction, this, { files: [config[key]] });

      // try to load data from file
      value = this.load(oneOffContext);

      // keep the entry if something's been resolved
      // empty or unchanged value signal otherwise
      if (isEmpty(value))
      {
        delete config[key];
      }
      else
      {
        config[key] = value;
      }
    }
    else if (isObject(config[key]))
    {
      includeFiles.call(this, config[key], backRef.concat(key));
    }
    // Unsupported entry type
    else
    {
      throw new Error('Illegal key type for custom-include-files at ' + backRef.concat(key).join('.') + ': ' + Object.prototype.toString.call(config[key]));
    }
  }.bind(this));

  return config;
}
