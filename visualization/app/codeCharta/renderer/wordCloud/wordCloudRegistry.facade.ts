// A second, deliberately lightweight public surface for the word-cloud engine.
//
// wordCloud.facade.ts re-exports WordCloudComponent, which statically pulls in echarts. Consumers that
// only need the chart handle — the screenshot service, which is loaded with the nav bar on every view —
// would drag ~600 KB of echarts out of the lazy domain-view chunk and back into the initial bundle just
// by touching that barrel. This surface carries nothing but the registry.
export { WordCloudChartRegistry } from "./services/wordCloudChart.registry"
