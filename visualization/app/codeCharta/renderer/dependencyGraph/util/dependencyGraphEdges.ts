import { drawnItem, UNTRANSFORMED } from "./dependencyGraphElements"
import { ToPixels } from "./dependencyGraphScene"
import { DIMMED_OPACITY, edgeColor, edgeDash } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { EdgeRoute, Side } from "./edgeRouting"
import { Point } from "./geometry"

const MIN_ARROW_LENGTH_PX = 8
const MIN_ARROW_HALF_WIDTH_PX = 4
const ARROW_LENGTH_PER_LINE_WIDTH = 3
const ARROW_HALF_WIDTH_PER_LINE_WIDTH = 1.5
const MIN_CURVE_PULL_PX = 24
const MIN_ASIDE_BULGE_PX = 40
const ASIDE_BULGE_PER_HEIGHT = 0.35
/** How far a dependency running both ways bows out, each direction to its own side. */
const TWO_WAY_ARC_PX = 14
/** Pulls a third and two thirds of the way along keep a bezier on the straight line between its ends. */
const PULL_SHARES = { start: 1 / 3, end: 2 / 3 }
const ON_THE_LINE_PX = 0

interface Curve {
    start: Point
    startPull: Point
    endPull: Point
    end: Point
}

export interface EdgeLook {
    isDimmed: boolean
    widthPx: number
}

const OUTWARD: Record<Side, Point> = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }

export function drawEdge(edge: GraphEdge, route: EdgeRoute, { isDimmed, widthPx }: EdgeLook, toPixels: ToPixels) {
    const curve = bend(route, asPoint(toPixels(route.start)), asPoint(toPixels(route.end)))
    const color = edgeColor(edge.type)
    const opacity = isDimmed ? DIMMED_OPACITY : 1
    return drawnItem([
        {
            type: "bezierCurve",
            ...UNTRANSFORMED,
            shape: {
                x1: curve.start[0],
                y1: curve.start[1],
                cpx1: curve.startPull[0],
                cpy1: curve.startPull[1],
                cpx2: curve.endPull[0],
                cpy2: curve.endPull[1],
                x2: curve.end[0],
                y2: curve.end[1]
            },
            style: { stroke: color, lineWidth: widthPx, lineDash: edgeDash(edge.type), fill: null, opacity }
        },
        { type: "polygon", ...UNTRANSFORMED, shape: { points: arrowHead(curve, widthPx) }, style: { fill: color, opacity } }
    ])
}

function bend(route: EdgeRoute, start: Point, end: Point): Curve {
    switch (route.bend) {
        case "straight":
            return pulledAlong(start, end, ON_THE_LINE_PX)
        case "arc":
            return pulledAlong(start, end, TWO_WAY_ARC_PX)
        case "aside": {
            const bulgeX = Math.max(start[0], end[0]) + Math.max(MIN_ASIDE_BULGE_PX, Math.abs(end[1] - start[1]) * ASIDE_BULGE_PER_HEIGHT)
            return { start, startPull: [bulgeX, start[1]], endPull: [bulgeX, end[1]], end }
        }
        default:
            return sCurve(route, start, end)
    }
}

function pulledAlong(start: Point, end: Point, sidewaysPx: number): Curve {
    return {
        start,
        startPull: along(start, end, PULL_SHARES.start, sidewaysPx),
        endPull: along(start, end, PULL_SHARES.end, sidewaysPx),
        end
    }
}

function sCurve({ startSide, endSide }: EdgeRoute, start: Point, end: Point): Curve {
    const isVertical = startSide === "top" || startSide === "bottom"
    const distance = Math.abs(isVertical ? end[1] - start[1] : end[0] - start[0])
    const pull = Math.max(distance / 2, MIN_CURVE_PULL_PX)
    return { start, startPull: pushedOut(start, startSide, pull), endPull: pushedOut(end, endSide, pull), end }
}

function pushedOut(point: Point, side: Side, distance: number): Point {
    const [outX, outY] = OUTWARD[side]
    return [point[0] + outX * distance, point[1] + outY * distance]
}

/** Sideways is to the left of the direction of travel. */
function along(start: Point, end: Point, share: number, sideways: number): Point {
    const deltaX = end[0] - start[0]
    const deltaY = end[1] - start[1]
    const length = Math.hypot(deltaX, deltaY) || 1
    return [start[0] + deltaX * share + (deltaY / length) * sideways, start[1] + deltaY * share - (deltaX / length) * sideways]
}

function asPoint(pixels: number[]): Point {
    return [pixels[0], pixels[1]]
}

/** Grows with a wide line, so the line never swallows it. */
function arrowHead({ endPull, end }: Curve, lineWidthPx: number): Point[] {
    const length = Math.max(MIN_ARROW_LENGTH_PX, lineWidthPx * ARROW_LENGTH_PER_LINE_WIDTH)
    const halfWidth = Math.max(MIN_ARROW_HALF_WIDTH_PX, lineWidthPx * ARROW_HALF_WIDTH_PER_LINE_WIDTH)
    const angle = Math.atan2(end[1] - endPull[1], end[0] - endPull[0])
    const baseX = end[0] - Math.cos(angle) * length
    const baseY = end[1] - Math.sin(angle) * length
    const offsetX = Math.sin(angle) * halfWidth
    const offsetY = -Math.cos(angle) * halfWidth
    return [end, [baseX + offsetX, baseY + offsetY], [baseX - offsetX, baseY - offsetY]]
}
