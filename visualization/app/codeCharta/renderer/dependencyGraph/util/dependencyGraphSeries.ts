/** Everything is drawn by one series: the open folders and level bands, then the edges, then the closed boxes and
 * the folders' names, so that no edge covers a name.
 * An edge over a box does not take the box's clicks: the host hands them on to the box underneath. */
export const GRAPH_SERIES_ID = "graph"

/** A data item of the series; a box carries its path as its name, an edge says it is one. */
export interface GraphDatum {
    name?: string
    isEdge?: boolean
}
