// CommonJS config in a .cjs file.
function dungeonPlugins(isMinified) {
  if (isMinified) {
    return { cssnano: {} }
  }
  return {}
}

module.exports = { plugins: dungeonPlugins(false) }
