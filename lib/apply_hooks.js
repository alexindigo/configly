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
  // sort hooks short first + alphabetically
  Object.keys(this.hooks).sort(compareHooks).forEach(function(hook)
  {
    // in order to match hook should either the same length
    // as the filename or smaller
    if (filename.substr(0, hook.length) === hook)
    {
      config = this.hooks[hook].call(this, config);
    }
  }.bind(this));

  return config;
}

/**
 * Compares hook names shorter to longer and alphabetically
 *
 * @param   {string} a - first key
 * @param   {string} b - second key
 * @returns {number} -1 - `a` comes first, 0 - positions unchanged, 1 - `b` comes first
 */
function compareHooks(a, b)
{
  return a.length < b.length ? -1 : (a.length > b.length ? 1 : (a < b ? -1 : (a > b ? 1 : 0)));
}
