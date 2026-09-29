import { EdgeFilter, GraphEdge } from "./edgeProjection"
import { EdgeStyle } from "./edgeRouting"
import { DependencyGraphLayout, LayoutBox } from "./levelizedLayout"

/** Everything one frame of the dependency graph shows. The paths are box paths: a selection or hover
 * deeper than the boxes on screen arrives already lifted onto the box standing for it. */
export interface DependencyGraphScene {
    layout: DependencyGraphLayout
    edges: GraphEdge[]
    edgeFilter: EdgeFilter
    edgeStyle: EdgeStyle
    hoveredPath: string | null
    selectedPath: string | null
    /** Dragged boxes, the most recently dragged last: they paint above their siblings. */
    raisedPaths: readonly string[]
    /** The box the reader is dragging right now, if any. */
    draggingPath: string | null
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
