import {
    DependencyEdgeColors,
    DependencyEdgeShape,
    DependencyEdgeStyle,
    DependencyEdgeType,
    DependencyEdgeWidth,
    LineStyleMeaning
} from "../../../model/dependencyGraph.model"
import { IsInside } from "./boxNesting"
import { parentPathOf } from "./boxPaths"
import { CycleMarks } from "./cycleMarks"
import { GraphEdge } from "./edgeProjection"
import { Point } from "./geometry"
import { DependencyGraphLayout, LayoutBox } from "./layoutModel"

/** The paths are box paths: a selection or hover deeper than the boxes on screen arrives already lifted onto
 * the box standing for it. */
export interface DependencyGraphScene {
    layout: DependencyGraphLayout
    edges: GraphEdge[]
    /** The edges' weight is its value. */
    edgeMetric: string | null
    /** The hovered box's edges are drawn whatever their type. */
    shownEdgeTypes: readonly DependencyEdgeType[]
    edgeColors: DependencyEdgeColors
    lineStyleShows: LineStyleMeaning
    cycleMarks: CycleMarks
    edgeStyle: DependencyEdgeStyle
    edgeShape: DependencyEdgeShape
    isAnchoredAtSideMiddle: boolean
    edgeWidth: DependencyEdgeWidth
    hoveredPath: string | null
    selectedPath: string | null
    selectedEdgeId: string | null
    /** Edges the reader points at from outside the graph; while there are any, the others step back. */
    highlightedEdgeIds: ReadonlySet<string>
    /** Dragged boxes, the most recently dragged last: they paint above their siblings. */
    raisedPaths: readonly string[]
    draggingPath: string | null
    /** Files and folders alike; null while no search is on. */
    searchedPaths: ReadonlySet<string> | null
}

export type ToPixels = (layoutPoint: Point) => number[]

/** A hovered box's edges are the ones crossing its border. An open folder holds edges between its own
 * children too, and the root holds every edge; showing those would light up the whole graph. */
export function isEdgeOfHovered(edge: GraphEdge, hoveredPath: string | null, isInside: IsInside): boolean {
    return hoveredPath !== null && isInside(edge.fromPath, hoveredPath) !== isInside(edge.toPath, hoveredPath)
}

/** Drawn whatever its type, and never dimmed. */
export function isEdgeInFocus(edge: GraphEdge, { selectedEdgeId, highlightedEdgeIds }: EdgeFocus): boolean {
    return edge.id === selectedEdgeId || highlightedEdgeIds.has(edge.id)
}

type EdgeFocus = Pick<DependencyGraphScene, "selectedEdgeId" | "highlightedEdgeIds">

/** A box counts as found when it holds something the search found, or lies in a folder it found. What a box
 * holds is read from the layout, what folder a node lies in from its path. */
export function searchMatcher(
    searchedPaths: ReadonlySet<string> | null,
    boxesByPath: ReadonlyMap<string, LayoutBox>
): (boxPath: string) => boolean {
    if (searchedPaths === null) {
        return () => true
    }
    const foundOrHoldingFound = new Set<string>()
    const holderOf = (path: string) => (boxesByPath.has(path) ? (boxesByPath.get(path).parentPath ?? "") : parentPathOf(path))
    for (const path of searchedPaths) {
        for (let holder = path; holder !== "" && !foundOrHoldingFound.has(holder); holder = holderOf(holder)) {
            foundOrHoldingFound.add(holder)
        }
    }
    return boxPath => foundOrHoldingFound.has(boxPath) || ancestorsOf(boxPath).some(ancestor => searchedPaths.has(ancestor))
}

function ancestorsOf(path: string): string[] {
    const ancestors: string[] = []
    for (let ancestor = parentPathOf(path); ancestor !== ""; ancestor = parentPathOf(ancestor)) {
        ancestors.push(ancestor)
    }
    return ancestors
}
