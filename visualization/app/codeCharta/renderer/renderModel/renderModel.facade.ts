/**
 * renderModel — the cross-lens composing layer (Slice 15).
 *
 * The single public surface of the render model: it folds the structure + metrics + dependency
 * lenses and the view-state homes into the decorated tree and its derived read models
 * (accumulatedData, codeMapNodes, pathToNode, rootUnary, metricData, the derived metric selectors,
 * the node-resolving selectors and the render-availability gates). It sits ABOVE the lenses and
 * homes: it may read lens facades + home READ facades + fileStore + util + model DOWNWARD, and
 * nothing below it (lenses, fileStore, the state homes) may import it back — enforced by
 * `render-model-is-top-derived-layer`. Consumers (features, load/, effects, renderers) reach every
 * composing selector through this barrel; the internal selector modules import each other directly.
 */
export * from "./accumulatedData/accumulatedData.selector"
export * from "./accumulatedData/codeMapNodes.selector"
export * from "./accumulatedData/pathToNode.selector"
export * from "./accumulatedData/idToNode.selector"
export * from "./accumulatedData/rootUnary.selector"
export * from "./accumulatedData/metricData/metricData.selector"
export * from "./accumulatedData/metricData/selectedColorMetricData.selector"
export * from "./allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
export * from "./amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector"
export * from "./edgeMetricData/edgeMetricData.selector"
export * from "./edgeMetricData/sortedNodeEdgeMetricsMap.selector"
export * from "./nodeMetricData/nodeMetricData.selector"
export * from "./primaryMetrics/primaryMetricNames.selector"
export * from "./searchedNodes/searchedNodes.selector"
export * from "./searchedNodes/searchedNodePaths.selector"
export * from "./hoveredNode.selector"
export * from "./selectedNode.selector"
export * from "./rightClickedCodeMapNode.selector"
export * from "./labelsPerMapActive.selector"
