/** Everything is drawn by one series: the boxes and level bands in paint order, then the edges above them all.
 * An edge over a box does not take the box's clicks: the host hands them on to the box underneath. */
export const GRAPH_SERIES_ID = "graph"

/** A data item of the series; a box carries its path as its name, an edge says it is one. */
export interface GraphDatum {
    name?: string
    isEdge?: boolean
}
