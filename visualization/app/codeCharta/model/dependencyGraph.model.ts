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
    factor: number
}

/** Spread hands every edge its own spot on a side, so it has no middle to gather them at. */
export function canAnchorAtSideMiddle(edgeStyle: DependencyEdgeStyle): boolean {
    return edgeStyle !== "spread"
}

/** A level band is named by its own number, or by the levels of the folders around it first, as in 0.1.2. */
export type DependencyLevelLabel = "number" | "path"

export interface DependencyGraphSettings {
    shownEdgeTypes: DependencyEdgeType[]
    edgeStyle: DependencyEdgeStyle
    isAnchoredAtSideMiddle: boolean
    edgeWidth: DependencyEdgeWidth
    levelLabel: DependencyLevelLabel
}
