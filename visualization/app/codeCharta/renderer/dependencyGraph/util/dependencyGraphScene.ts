import { EdgeFilter, GraphEdge } from "./edgeProjection"
import { EdgeStyle } from "./edgeRouting"
import { EdgeWidth } from "./edgeWidth"
import { DependencyGraphLayout, LayoutBox } from "./levelizedLayout"

/** Everything one frame of the dependency graph shows. The paths are box paths: a selection or hover
 * deeper than the boxes on screen arrives already lifted onto the box standing for it. */
export interface DependencyGraphScene {
    layout: DependencyGraphLayout
    edges: GraphEdge[]
    edgeFilter: EdgeFilter
    edgeStyle: EdgeStyle
    /** Every edge starts and ends at the middle of its sides, whatever the style. */
    isAnchoredAtSideMiddle: boolean
    edgeWidth: EdgeWidth
    hoveredPath: string | null
    selectedPath: string | null
    /** Dragged boxes, the most recently dragged last: they paint above their siblings. */
    raisedPaths: readonly string[]
    /** The box the reader is dragging right now, if any. */
    draggingPath: string | null
    /** What a search found, files and folders alike; null while no search is on. */
    searchedPaths: ReadonlySet<string> | null
}

/** Converts a point of the layout into pixels on the chart; the zoom and pan decide the mapping. */
export type ToPixels = (point: [number, number]) => number[]

function touches(path: string, target: string): boolean {
    return path === target || path.startsWith(`${target}/`)
}

/** A hovered box's edges are the ones crossing its border. An open folder holds edges between its own
 * children too, and the root holds every edge; showing those would light up the whole graph. */
export function isEdgeOfHovered(edge: GraphEdge, hoveredPath: string | null): boolean {
    return hoveredPath !== null && touches(edge.fromPath, hoveredPath) !== touches(edge.toPath, hoveredPath)
}

export function boxesByPath(layout: DependencyGraphLayout): Map<string, LayoutBox> {
    return new Map(layout.boxes.map(box => [box.path, box]))
}

/** Whether a box holds something the search found, or lies in a folder it found. Everything counts as found
 * while no search is on. */
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
