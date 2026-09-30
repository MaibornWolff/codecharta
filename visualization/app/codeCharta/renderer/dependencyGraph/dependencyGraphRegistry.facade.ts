// Carries nothing but the registry: dependencyGraph.facade.ts re-exports DependencyGraphComponent, whose static echarts
// import would pull the charting library into the initial bundle for the eagerly loaded screenshot service.
export { DependencyGraphChartRegistry } from "./services/dependencyGraphChart.registry"
