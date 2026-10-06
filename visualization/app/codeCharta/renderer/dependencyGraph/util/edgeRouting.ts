import { canAnchorAtSideMiddle, DependencyEdgeStyle } from "../../../model/dependencyGraph.model"
import { addToGroup } from "./collections"
import { GraphEdge } from "./edgeProjection"
import { Point } from "./geometry"
import { LayoutBox } from "./layoutModel"

export type Side = "top" | "bottom" | "left" | "right"

type Bend = "sCurve" | "aside" | "straight" | "arc"

/** In layout units. */
export interface EdgeRoute {
    start: Point
    startSide: Side
    end: Point
    endSide: Side
    bend: Bend
}

interface Sides {
    startSide: Side
    endSide: Side
}

type EndOfEdge = "start" | "end"

interface RoutingInput {
    edges: GraphEdge[]
    sides: Sides[]
    byPath: ReadonlyMap<string, LayoutBox>
}

interface SideEnd {
    key: string
    along: number
    lane: Lane
    id: string
}

/** The half of a box's side, as a share along it, that an edge keeps to at both ends. */
type Lane = "low" | "high"

/** Each edge keeps to the half on the left of its direction of travel, which is also the side an edge bows to
 * (see `along` in the edges), so the two edges of a two-way dependency run apart and never cross, whichever box
 * is above. Leaving through the bottom travels down, whose left on screen is the higher x. */
const LANE_BY_START_SIDE: Record<Side, Lane> = { bottom: "high", top: "low", right: "low", left: "high" }
const CURVED_PORT: Record<Lane, number> = { low: 0.42, high: 0.58 }
const PORT_MARGIN = 0.1
const SIDE_MIDDLE = 0.5

export function routeEdges(
    edges: GraphEdge[],
    byPath: ReadonlyMap<string, LayoutBox>,
    style: DependencyEdgeStyle,
    isAnchoredAtSideMiddle = false
): EdgeRoute[] {
    const sides = edges.map(edge => sidesOf(byPath.get(edge.fromPath), byPath.get(edge.toPath), style))
    const isAnchored = isAnchoredAtSideMiddle && canAnchorAtSideMiddle(style)
    const portOf = portsFor({ edges, sides, byPath }, style, isAnchored)
    const edgeIds = new Set(edges.map(edge => edge.id))
    return edges.map((edge, index) => {
        const { startSide, endSide } = sides[index]
        const runsBothWays = edgeIds.has(`${edge.toPath}|${edge.fromPath}`)
        const bend = bendOf(style, sides[index], runsBothWays)
        return {
            start: pointOn(byPath.get(edge.fromPath), startSide, portOf(index, "start")),
            startSide,
            end: pointOn(byPath.get(edge.toPath), endSide, portOf(index, "end")),
            endSide,
            bend: isAnchored && runsBothWays && bend !== "aside" ? "arc" : bend
        }
    })
}

type PortOf = (index: number, end: EndOfEdge) => number

function portsFor(input: RoutingInput, style: DependencyEdgeStyle, isAnchoredAtSideMiddle: boolean): PortOf {
    if (isAnchoredAtSideMiddle) {
        return () => SIDE_MIDDLE
    }
    return style === "curved" ? (index: number) => CURVED_PORT[laneOf(input.sides[index])] : spreadPorts(input)
}

function sidesOf(from: LayoutBox, to: LayoutBox, style: DependencyEdgeStyle): Sides {
    if (to.y >= from.y + from.height) {
        return { startSide: "bottom", endSide: "top" }
    }
    if (to.y + to.height <= from.y) {
        return style === "upwardAside" ? { startSide: "right", endSide: "right" } : { startSide: "top", endSide: "bottom" }
    }
    return to.x >= from.x + from.width ? { startSide: "right", endSide: "left" } : { startSide: "left", endSide: "right" }
}

function bendOf(style: DependencyEdgeStyle, { startSide, endSide }: Sides, runsBothWays: boolean): Bend {
    if (style === "straight") {
        return runsBothWays ? "arc" : "straight"
    }
    return style === "upwardAside" && startSide === "right" && endSide === "right" ? "aside" : "sCurve"
}

function laneOf({ startSide }: Sides): Lane {
    return LANE_BY_START_SIDE[startSide]
}

/** Each side of a box hands out its ports in the order in which the edges' other ends lie along it, so the
 * edges fan out instead of crossing right at the box; edges to the same box keep to their lanes. */
function spreadPorts(input: RoutingInput) {
    const endsBySide = endsGroupedBySide(input)
    const ports = new Map<string, number>()
    for (const ends of endsBySide.values()) {
        ends.sort((endA, endB) => endA.along - endB.along || laneRank(endA.lane) - laneRank(endB.lane) || endA.id.localeCompare(endB.id))
        ends.forEach(({ key }, rank) => ports.set(key, PORT_MARGIN + ((1 - 2 * PORT_MARGIN) * (rank + 1)) / (ends.length + 1)))
    }
    return (index: number, end: EndOfEdge) => ports.get(`${index}|${end}`)
}

function endsGroupedBySide({ edges, sides, byPath }: RoutingInput): Map<string, SideEnd[]> {
    const endsBySide = new Map<string, SideEnd[]>()
    edges.forEach((edge, index) => {
        const ends: [string, Side, string, EndOfEdge][] = [
            [edge.fromPath, sides[index].startSide, edge.toPath, "start"],
            [edge.toPath, sides[index].endSide, edge.fromPath, "end"]
        ]
        for (const [boxPath, side, otherPath, end] of ends) {
            const along = alongSide(side, byPath.get(otherPath))
            addToGroup(endsBySide, `${boxPath}|${side}`, { key: `${index}|${end}`, along, lane: laneOf(sides[index]), id: edge.id })
        }
    })
    return endsBySide
}

function laneRank(lane: Lane): number {
    return lane === "low" ? 0 : 1
}

function alongSide(side: Side, box: LayoutBox): number {
    return side === "top" || side === "bottom" ? box.x + box.width / 2 : box.y + box.height / 2
}

function pointOn(box: LayoutBox, side: Side, share: number): Point {
    switch (side) {
        case "top":
            return [box.x + box.width * share, box.y]
        case "bottom":
            return [box.x + box.width * share, box.y + box.height]
        case "left":
            return [box.x, box.y + box.height * share]
        default:
            return [box.x + box.width, box.y + box.height * share]
    }
}
