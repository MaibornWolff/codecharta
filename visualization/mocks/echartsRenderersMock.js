// Stub for `echarts/renderers`. Kept separate from echartsMock.js: mapping several echarts entry points
// onto one file collapses them into a single module identity, so a spec's jest.mock for one of them
// would silently replace the others.
module.exports = { CanvasRenderer: {}, SVGRenderer: {} }
