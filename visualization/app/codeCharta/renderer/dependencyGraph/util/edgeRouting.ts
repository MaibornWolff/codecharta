import { GraphEdge } from "./edgeProjection"
import { LayoutBox } from "./levelizedLayout"

/** How edges are drawn. Curved leaves and enters every box at one point per direction; the others spread a box's edges
 * along its side by where their other end lies. Upward aside swings upward edges out to the right, and
 * straight draws straight lines as DependaCharta does, bending only a dependency that runs both ways. */
export type EdgeStyle = "curved" | "spread" | "upwardAside" | "straight"

export type Side = "top" | "bottom" | "left" | "right"

type Bend = "sCurve" | "aside" | "straight" | "arc"

type LayoutPoint = [number, number]

/** Where an edge leaves and enters, in layout units, and how it bends between. */
export interface EdgeRoute {
    start: LayoutPoint
    startSide: Side
    end: LayoutPoint
    endSide: Side
    bend: Bend
}

interface Sides {
    startSide: Side
    endSide: Side
}

type EndOfEdge = "start" | "end"

/** The half of a box's side, as a share along it, that an edge keeps to at both ends. */
type Lane = "low" | "high"

/** Each edge keeps to the half on the left of its direction of travel, which is also the side an edge bows to
 * (see `along` in the edges), so the two edges of a two-way dependency run apart and never cross, whichever box
 * is above. Leaving through the bottom travels down, whose left on screen is the higher x. */
const LANE_BY_START_SIDE: Record<Side, Lane> = { bottom: "high", top: "low", right: "low", left: "high" }
const CURVED_PORT: Record<Lane, number> = { low: 0.42, high: 0.58 }
const PORT_MARGIN = 0.1
const SIDE_MIDDLE = 0.5

/** Anchored at the side's middle, every edge starts and ends at the middle of its sides, whatever the style. */
export function routeEdges(
    edges: GraphEdge[],
    byPath: ReadonlyMap<string, LayoutBox>,
    style: EdgeStyle,
    isAnchoredAtSideMiddle = false
): EdgeRoute[] {
    const sides = edges.map(edge => sidesOf(byPath.get(edge.fromPath), byPath.get(edge.toPath), style))
    const portOf = portsFor(edges, sides, byPath, style, isAnchoredAtSideMiddle)
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
            bend: isAnchoredAtSideMiddle && runsBothWays && bend !== "aside" ? "arc" : bend
        }
    })
}

type PortOf = (index: number, end: EndOfEdge) => number

function portsFor(
    edges: GraphEdge[],
    sides: Sides[],
    byPath: ReadonlyMap<string, LayoutBox>,
    style: EdgeStyle,
    isAnchoredAtSideMiddle: boolean
): PortOf {
    if (isAnchoredAtSideMiddle) {
        return () => SIDE_MIDDLE
    }
    return style === "curved" ? (index: number) => CURVED_PORT[laneOf(sides[index])] : spreadPorts(edges, sides, byPath)
}

/** Downward edges leave through the bottom and enter through the top, upward edges the other way round or,
 * aside, through the right, and edges between boxes side by side run between their facing sides. */
function sidesOf(from: LayoutBox, to: LayoutBox, style: EdgeStyle): Sides {
    if (to.y >= from.y + from.height) {
        return { startSide: "bottom", endSide: "top" }
    }
    if (to.y + to.height <= from.y) {
        return style === "upwardAside" ? { startSide: "right", endSide: "right" } : { startSide: "top", endSide: "bottom" }
    }
    return to.x >= from.x + from.width ? { startSide: "right", endSide: "left" } : { startSide: "left", endSide: "right" }
}

function bendOf(style: EdgeStyle, { startSide, endSide }: Sides, runsBothWays: boolean): Bend {
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
function spreadPorts(edges: GraphEdge[], sides: Sides[], byPath: ReadonlyMap<string, LayoutBox>) {
    const endsBySide = new Map<string, { key: string; along: number; lane: Lane; id: string }[]>()
    edges.forEach((edge, index) => {
        const ends: [string, Side, string, EndOfEdge][] = [
            [edge.fromPath, sides[index].startSide, edge.toPath, "start"],
            [edge.toPath, sides[index].endSide, edge.fromPath, "end"]
        ]
        for (const [boxPath, side, otherPath, end] of ends) {
            const sideKey = `${boxPath}|${side}`
            const along = alongSide(side, byPath.get(otherPath))
            const lane = laneOf(sides[index])
            endsBySide.set(sideKey, [...(endsBySide.get(sideKey) ?? []), { key: `${index}|${end}`, along, lane, id: edge.id }])
        }
    })
    const ports = new Map<string, number>()
    for (const ends of endsBySide.values()) {
        ends.sort((endA, endB) => endA.along - endB.along || laneRank(endA.lane) - laneRank(endB.lane) || endA.id.localeCompare(endB.id))
        ends.forEach(({ key }, rank) => ports.set(key, PORT_MARGIN + ((1 - 2 * PORT_MARGIN) * (rank + 1)) / (ends.length + 1)))
    }
    return (index: number, end: EndOfEdge) => ports.get(`${index}|${end}`)
}

function laneRank(lane: Lane): number {
    return lane === "low" ? 0 : 1
}

function alongSide(side: Side, box: LayoutBox): number {
    return side === "top" || side === "bottom" ? box.x + box.width / 2 : box.y + box.height / 2
}

function pointOn(box: LayoutBox, side: Side, share: number): LayoutPoint {
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
