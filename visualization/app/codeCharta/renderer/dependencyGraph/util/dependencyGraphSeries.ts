/** One series draws everything, so the paint order alone decides what covers what. */
export const GRAPH_SERIES_ID = "graph"

/** A data item of the series; a box carries its path as its name, an edge says it is one. */
export interface GraphDatum {
    name?: string
    isEdge?: boolean
}
