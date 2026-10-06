import {
    DeclarationKindMark,
    DependencyEdgeColors,
    DependencyEdgeStyle,
    DependencyEdgeType,
    DependencyEdgeWidth,
    LineStyleMeaning
} from "../../../model/dependencyGraph.model"
import { isWithin } from "./boxPaths"
import { GraphEdge } from "./edgeProjection"
import { Point } from "./geometry"
import { DependencyGraphLayout, LayoutBox } from "./levelizedLayout"

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
    declarationKindMark: DeclarationKindMark
    edgeStyle: DependencyEdgeStyle
    isAnchoredAtSideMiddle: boolean
    edgeWidth: DependencyEdgeWidth
    hoveredPath: string | null
    selectedPath: string | null
    /** Dragged boxes, the most recently dragged last: they paint above their siblings. */
    raisedPaths: readonly string[]
    draggingPath: string | null
    /** Files and folders alike; null while no search is on. */
    searchedPaths: ReadonlySet<string> | null
}

export type ToPixels = (layoutPoint: Point) => number[]

/** A hovered box's edges are the ones crossing its border. An open folder holds edges between its own
 * children too, and the root holds every edge; showing those would light up the whole graph. */
export function isEdgeOfHovered(edge: GraphEdge, hoveredPath: string | null): boolean {
    return hoveredPath !== null && isWithin(edge.fromPath, hoveredPath) !== isWithin(edge.toPath, hoveredPath)
}

export function boxesByPath(layout: DependencyGraphLayout): Map<string, LayoutBox> {
    return new Map(layout.boxes.map(box => [box.path, box]))
}

/** A box counts as found when it holds something the search found, or lies in a folder it found. */
export function searchMatcher(searchedPaths: ReadonlySet<string> | null): (boxPath: string) => boolean {
    if (searchedPaths === null) {
        return () => true
    }
    const foundOrHoldingFound = new Set<string>()
    for (const path of searchedPaths) {
        for (let ancestor = path; ancestor !== "" && !foundOrHoldingFound.has(ancestor); ancestor = parentOf(ancestor)) {
            foundOrHoldingFound.add(ancestor)
        }
    }
    return boxPath => foundOrHoldingFound.has(boxPath) || ancestorsOf(boxPath).some(ancestor => searchedPaths.has(ancestor))
}

function parentOf(path: string): string {
    return path.slice(0, Math.max(path.lastIndexOf("/"), 0))
}

function ancestorsOf(path: string): string[] {
    const ancestors: string[] = []
    for (let ancestor = parentOf(path); ancestor !== ""; ancestor = parentOf(ancestor)) {
        ancestors.push(ancestor)
    }
    return ancestors
}
