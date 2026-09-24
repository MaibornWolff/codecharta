import { CENTRE_RADIUS, FULL_TURN } from "./radialChartStyle"
import { RadialNode } from "./radialTree"

/** Angles in radians, clockwise from twelve o'clock; radii as a share of half the chart's shorter side. */
export interface AnnularSector {
    startAngle: number
    endAngle: number
    innerRadius: number
    outerRadius: number
}

export type SectorRole = "centre" | "ring" | "header" | "cell" | "outline"

export interface PlacedSector extends AnnularSector {
    role: SectorRole
}

export interface RadialPlacement {
    node: RadialNode
    isCentre: boolean
    sectors: PlacedSector[]
}

export type AngularSpan = Pick<AnnularSector, "startAngle" | "endAngle">

export const FULL_CIRCLE: AngularSpan = { startAngle: 0, endAngle: FULL_TURN }

export const CENTRE_SECTOR: PlacedSector = { role: "centre", ...FULL_CIRCLE, innerRadius: 0, outerRadius: CENTRE_RADIUS }

export function largestFirst(nodes: RadialNode[]): RadialNode[] {
    return [...nodes].sort(compareLargestFirst)
}

export function compareLargestFirst(first: RadialNode, second: RadialNode): number {
    return second.area - first.area || first.path.localeCompare(second.path)
}
