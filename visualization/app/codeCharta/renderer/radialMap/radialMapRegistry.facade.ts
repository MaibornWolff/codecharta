// Carries nothing but the registry: radialMap.facade.ts re-exports RadialChartComponent, whose static echarts
// import would pull the charting library into the initial bundle for the eagerly loaded screenshot service.
export { RadialChartRegistry } from "./services/radialChart.registry"
