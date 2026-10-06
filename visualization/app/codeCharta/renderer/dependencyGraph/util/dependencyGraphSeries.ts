/** One series draws everything, so the paint order alone decides what covers what. */
export const GRAPH_SERIES_ID = "graph"

export interface GraphDatum {
    name?: string
    /** The box a title drawn apart from it belongs to. */
    titledBoxPath?: string
    isEdge?: boolean
    edgeId?: string
}
