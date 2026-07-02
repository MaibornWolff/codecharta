// TODO: Remove the unary metric.
// The synthetic "unary" metric (every node counts as 1) is added during node-metric
// calculation but is also referenced by the shared decoration/export kernel, so the
// constant lives here rather than inside the metrics lens.
export const UNARY_METRIC = "unary"
