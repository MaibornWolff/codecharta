// Global unit-test stub for the echarts runtime (its published entry is ESM and pulls in the whole
// zrender tree, which jest does not transform). Only the word-cloud component touches echarts; its own
// spec overrides this with an explicit jest.mock to assert on the chart instance. Every other spec that
// merely imports the view/route chain gets this inert stub so the import resolves.
const chart = {
    setOption() {},
    resize() {},
    dispose() {}
}

module.exports = {
    init: () => chart
}
