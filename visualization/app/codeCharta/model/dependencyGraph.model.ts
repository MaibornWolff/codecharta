/** DependaCharta's four edge types. A pure function of the two flags an edge carries, so it is derived
 * where it is consumed; only which of them the reader wants to see is kept. */
export type DependencyEdgeType = "regular" | "cyclic" | "feedbackContainerLevel" | "feedbackLeafLevel"

export const DEPENDENCY_EDGE_TYPES: readonly DependencyEdgeType[] = ["regular", "cyclic", "feedbackContainerLevel", "feedbackLeafLevel"]

/** How edges are drawn. Curved leaves and enters every box at one point per direction; the others spread a box's edges
 * along its side by where their other end lies. Upward aside swings upward edges out to the right, and
 * straight draws straight lines as DependaCharta does, bending only a dependency that runs both ways. */
export type DependencyEdgeStyle = "curved" | "spread" | "upwardAside" | "straight"

export type DependencyEdgeThickness = "byCount" | "thin" | "uniform" | "strong"

export interface DependencyEdgeWidth {
    thickness: DependencyEdgeThickness
    /** Scales every width the thickness gives. */
    factor: number
}
