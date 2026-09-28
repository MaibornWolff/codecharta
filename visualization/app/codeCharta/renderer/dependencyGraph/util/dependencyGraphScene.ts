import { EdgeFilter, GraphEdge } from "./edgeProjection"
import { DependencyGraphLayout, LayoutBox } from "./levelizedLayout"

/** Everything one frame of the dependency graph shows. The paths are box paths: a selection or hover
 * deeper than the boxes on screen arrives already lifted onto the box standing for it. */
export interface DependencyGraphScene {
    layout: DependencyGraphLayout
    edges: GraphEdge[]
    edgeFilter: EdgeFilter
    hoveredPath: string | null
    selectedPath: string | null
}

/** Converts a point of the layout into pixels on the chart; the zoom and pan decide the mapping. */
export type ToPixels = (point: [number, number]) => number[]

function touches(path: string, target: string): boolean {
    return path === target || path.startsWith(`${target}/`)
}

export function isEdgeOfHovered(edge: GraphEdge, hoveredPath: string | null): boolean {
    return hoveredPath !== null && (touches(edge.fromPath, hoveredPath) || touches(edge.toPath, hoveredPath))
}

export function boxesByPath(layout: DependencyGraphLayout): Map<string, LayoutBox> {
    return new Map(layout.boxes.map(box => [box.path, box]))
}
