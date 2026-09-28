import { drawnItem, UNTRANSFORMED } from "./dependencyGraphElements"
import { ToPixels } from "./dependencyGraphScene"
import { DIMMED_OPACITY, edgeColor, edgeDash, edgeWidthPx } from "./dependencyGraphStyle"
import { GraphEdge } from "./edgeProjection"
import { LayoutBox } from "./levelizedLayout"

const ARROW_LENGTH_PX = 8
const ARROW_HALF_WIDTH_PX = 4
const MIN_CURVE_PULL_PX = 24
/** Edges leave a box left of its middle and arrive right of it, so the two edges of a two-way
 * dependency run side by side instead of on top of each other. */
const LEAVING_AT = 0.42
const ARRIVING_AT = 0.58

type Point = [number, number]

interface Curve {
    start: Point
    startPull: Point
    endPull: Point
    end: Point
}

export function drawEdge(edge: GraphEdge, from: LayoutBox, to: LayoutBox, isDimmed: boolean, toPixels: ToPixels) {
    const curve = curveBetween(from, to, toPixels)
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
            style: { stroke: color, lineWidth: edgeWidthPx(edge.weight), lineDash: edgeDash(edge.type), fill: null, opacity }
        },
        { type: "polygon", ...UNTRANSFORMED, shape: { points: arrowHead(curve) }, style: { fill: color, opacity } }
    ])
}

/** Downward edges leave through the bottom and enter through the top, upward edges the other way round,
 * and edges between boxes side by side run between their facing sides. */
function curveBetween(from: LayoutBox, to: LayoutBox, toPixels: ToPixels): Curve {
    if (to.y >= from.y + from.height) {
        return verticalCurve(
            toPixels([from.x + from.width * LEAVING_AT, from.y + from.height]),
            toPixels([to.x + to.width * ARRIVING_AT, to.y])
        )
    }
    if (to.y + to.height <= from.y) {
        return verticalCurve(
            toPixels([from.x + from.width * LEAVING_AT, from.y]),
            toPixels([to.x + to.width * ARRIVING_AT, to.y + to.height])
        )
    }
    const isRightward = to.x >= from.x + from.width
    const start = toPixels([isRightward ? from.x + from.width : from.x, from.y + from.height * LEAVING_AT])
    const end = toPixels([isRightward ? to.x : to.x + to.width, to.y + to.height * ARRIVING_AT])
    return horizontalCurve(start, end)
}

function verticalCurve(start: number[], end: number[]): Curve {
    const pull = Math.max(Math.abs(end[1] - start[1]) / 2, MIN_CURVE_PULL_PX) * Math.sign(end[1] - start[1] || 1)
    return { start: [start[0], start[1]], startPull: [start[0], start[1] + pull], endPull: [end[0], end[1] - pull], end: [end[0], end[1]] }
}

function horizontalCurve(start: number[], end: number[]): Curve {
    const pull = Math.max(Math.abs(end[0] - start[0]) / 2, MIN_CURVE_PULL_PX) * Math.sign(end[0] - start[0] || 1)
    return { start: [start[0], start[1]], startPull: [start[0] + pull, start[1]], endPull: [end[0] - pull, end[1]], end: [end[0], end[1]] }
}

function arrowHead({ endPull, end }: Curve): Point[] {
    const angle = Math.atan2(end[1] - endPull[1], end[0] - endPull[0])
    const baseX = end[0] - Math.cos(angle) * ARROW_LENGTH_PX
    const baseY = end[1] - Math.sin(angle) * ARROW_LENGTH_PX
    const offsetX = Math.sin(angle) * ARROW_HALF_WIDTH_PX
    const offsetY = -Math.cos(angle) * ARROW_HALF_WIDTH_PX
    return [end, [baseX + offsetX, baseY + offsetY], [baseX - offsetX, baseY - offsetY]]
}
