// Global unit-test stub for the echarts runtime (its published entry is ESM and pulls in the whole
// zrender tree, which jest does not transform). Only the word-cloud component touches echarts; its own
// spec overrides this with an explicit jest.mock to assert on the chart instance. Every other spec that
// merely imports the view/route chain gets this inert stub so the import resolves.
//
// Stands in for `echarts/core` too. The renderer and component entry points get their own stub files:
// mapping them all here would collapse them into one module identity, so a spec mocking one of them
// would silently replace the others.
const chart = {
    setOption() {},
    resize() {},
    dispose() {}
}

module.exports = {
    init: () => chart,
    use: () => {}
}
