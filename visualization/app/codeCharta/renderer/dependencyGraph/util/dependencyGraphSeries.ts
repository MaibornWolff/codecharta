/** Everything is drawn by one series, in paint order, so that stacking is one order for boxes, bands and edges
 * alike. An edge over a box does not take the box's clicks: the host hands them on to the box underneath. */
export const GRAPH_SERIES_ID = "graph"

/** A data item of the series; a box carries its path as its name, an edge says it is one. */
export interface GraphDatum {
    name?: string
    isEdge?: boolean
}
