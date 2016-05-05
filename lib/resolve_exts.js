// Public API
module.exports = resolveExts;

/**
 * Resolves parsers object into a string
 * of sorted extensions
 *
 * @returns {array} - sorted extensions  (e.g. `[cson, json, zson]`)
 */
function resolveExts()
{
  return Object.keys(this.parsers).sort(this.compareExtensions);
}
