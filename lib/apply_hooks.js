// Public API
module.exports = applyHooks;

/**
 * Applies matched hooks
 *
 * @param   {object} config - config object to apply hooks to
 * @param   {string} filename - base filename to match hooks against
 * @returns {object} - modified config object
 */
function applyHooks(config, filename)
{
  Object.keys(this.hooks).forEach(function(hook)
  {
    // in order to match hook should either the same length
    // as the filename or smaller
    if (filename.substr(0, hook.length) === hook)
    {
      config = this.hooks[hook](config);
    }
  }.bind(this));

  return config;
}
