// Carries nothing but the registry: sunburst.facade.ts re-exports SunburstComponent, whose static echarts
// import would pull the charting library into the initial bundle for the eagerly loaded screenshot service.
export { SunburstChartRegistry } from "./services/sunburstChart.registry"
