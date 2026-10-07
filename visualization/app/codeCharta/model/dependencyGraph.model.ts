/** DependaCharta's four edge types. A pure function of the two flags an edge carries, so it is derived
 * where it is consumed; only which of them the reader wants to see is kept. */
export type DependencyEdgeType = "regular" | "cyclic" | "feedbackContainerLevel" | "feedbackLeafLevel"

export const DEPENDENCY_EDGE_TYPES: readonly DependencyEdgeType[] = ["regular", "cyclic", "feedbackContainerLevel", "feedbackLeafLevel"]

/** Where edges meet their boxes. Combined gathers a side's outgoing edges at one spot and its incoming ones at
 * another; the others spread a box's edges along its side by where their other end lies. Aside swings upward
 * edges out to the right of the boxes and downward ones out to the left. */
export type DependencyEdgeStyle = "combined" | "spread" | "aside"

/** Straight draws straight lines as DependaCharta does, bending only a dependency that runs both ways. */
export type DependencyEdgeShape = "curved" | "straight"

export type DependencyEdgeThickness = "byCount" | "thin" | "uniform" | "strong"

export interface DependencyEdgeWidth {
    thickness: DependencyEdgeThickness
    factor: number
}

/** Only Combined gathers the edges of a side, so only it has a middle to gather them at. */
export function canAnchorAtSideMiddle(edgeStyle: DependencyEdgeStyle): boolean {
    return edgeStyle === "combined"
}

/** An edge that goes aside is a bow by nature. */
export function canDrawStraight(edgeStyle: DependencyEdgeStyle): boolean {
    return edgeStyle !== "aside"
}

export interface DependencyEdgeDrawing {
    edgeStyle: DependencyEdgeStyle
    edgeShape: DependencyEdgeShape
    isAnchoredAtSideMiddle: boolean
}

/** A level band is named by its own number, or by the levels of the folders around it first, as in 0.1.2. */
export type DependencyLevelLabel = "number" | "path"

export type DependencyEdgeColors = Record<DependencyEdgeType, string>

export type LineStyleMeaning = "edgeType" | "usage"

export type DependencyHierarchy = "folders" | "packages"

export interface DependencyGraphSettings {
    shownEdgeTypes: DependencyEdgeType[]
    edgeColors: DependencyEdgeColors
    lineStyleShows: LineStyleMeaning
    edgeStyle: DependencyEdgeStyle
    edgeShape: DependencyEdgeShape
    isAnchoredAtSideMiddle: boolean
    edgeWidth: DependencyEdgeWidth
    levelLabel: DependencyLevelLabel
    hierarchy: DependencyHierarchy
    showsCycleBadges: boolean
}
