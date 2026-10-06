import { enclosingRectangle, Rectangle } from "./geometry"
import { DependencyGraphLayout } from "./layoutModel"

export interface Viewport {
    width: number
    height: number
}

const FIT_SHARE = 0.94

/** In layout units. */
export interface AxisWindow {
    x: [number, number]
    y: [number, number]
}

/** The axes reach the laid-out graph plus this share of its size on every side, room that dragged boxes can
 * grow the graph into and still be panned to. */
const DRAGGING_ROOM_SHARE = 1

export function axesReaching(layout: DependencyGraphLayout, viewport: Viewport, shownWindow: AxisWindow) {
    const room = Math.max(layout.width, layout.height) * DRAGGING_ROOM_SHARE
    const roomyGraph = windowAround({ x: -room, y: -room, width: layout.width + 2 * room, height: layout.height + 2 * room }, viewport, 1)
    // ECharts clamps the shown window to the axes, which would cut a window reaching past a graph that shrank.
    const reach = enclosingWindow(roomyGraph, shownWindow)
    return {
        xAxis: { type: "value", show: false, min: reach.x[0], max: reach.x[1] },
        yAxis: { type: "value", show: false, inverse: true, min: reach.y[0], max: reach.y[1] }
    }
}

// Values rather than percentages: ECharts maps a percentage onto the axes' reach, and that grows and shrinks
// with the graph, which would move and rescale the view on every redraw.
export function zoomBothAxesInsideTo({ x, y }: AxisWindow) {
    return [
        { type: "inside", xAxisIndex: 0, filterMode: "none", startValue: x[0], endValue: x[1] },
        { type: "inside", yAxisIndex: 0, filterMode: "none", startValue: y[0], endValue: y[1] }
    ]
}

function enclosingWindow(first: AxisWindow, second: AxisWindow): AxisWindow {
    return {
        x: [Math.min(first.x[0], second.x[0]), Math.max(first.x[1], second.x[1])],
        y: [Math.min(first.y[0], second.y[0]), Math.max(first.y[1], second.y[1])]
    }
}

/** Fits the graph as drawn, dragged boxes and the folders they grew included. */
export function fitWindowOf(layout: DependencyGraphLayout, viewport: Viewport): AxisWindow {
    const [root] = layout.boxes
    return windowAround(root ?? { x: 0, y: 0, width: layout.width, height: layout.height }, viewport, FIT_SHARE)
}

/** The part of the graph the reader asked to see, at no more than its natural size plus a half: a single
 * declaration filling the screen would lose the boxes around it that say where it is. */
const FOCUS = { share: 0.8, maxPixelsPerUnit: 1.5 }

/** The window to show so that the boxes of the given paths are in view: the one shown already when it holds them
 * all, so nothing moves without need, or else one around them. Null when none of them is on screen. */
export function windowHolding(paths: readonly string[], layout: DependencyGraphLayout, viewport: Viewport, shownWindow: AxisWindow | null) {
    const wanted = new Set(paths)
    const boxes = layout.boxes.filter(box => wanted.has(box.path))
    if (boxes.length === 0) {
        return null
    }
    const area = enclosingRectangle(boxes)
    return shownWindow && holds(shownWindow, area) ? shownWindow : windowAround(area, viewport, FOCUS.share, FOCUS.maxPixelsPerUnit)
}

function holds({ x, y }: AxisWindow, area: Rectangle): boolean {
    return x[0] <= area.x && area.x + area.width <= x[1] && y[0] <= area.y && area.y + area.height <= y[1]
}

/** Both axes get the same number of pixels per layout unit, so the graph is never squashed. */
function windowAround(area: Rectangle, viewport: Viewport, share: number, maxPixelsPerUnit = Number.POSITIVE_INFINITY): AxisWindow {
    const pixelsPerUnit = Math.min(Math.min(viewport.width / area.width, viewport.height / area.height) * share, maxPixelsPerUnit)
    if (!(Number.isFinite(pixelsPerUnit) && pixelsPerUnit > 0)) {
        return windowOf(area)
    }
    const halfWidth = viewport.width / pixelsPerUnit / 2
    const halfHeight = viewport.height / pixelsPerUnit / 2
    const centreX = area.x + area.width / 2
    const centreY = area.y + area.height / 2
    return { x: [centreX - halfWidth, centreX + halfWidth], y: [centreY - halfHeight, centreY + halfHeight] }
}

/** Keeps the window's centre and its pixels per layout unit, so a resized chart shows more or less of the graph
 * at the same scale rather than stretching it. */
export function windowResizedTo(shownWindow: AxisWindow, from: Viewport, to: Viewport): AxisWindow {
    return { x: axisResizedTo(shownWindow.x, from.width, to.width), y: axisResizedTo(shownWindow.y, from.height, to.height) }
}

function axisResizedTo([start, end]: [number, number], fromPixels: number, toPixels: number): [number, number] {
    const centre = (start + end) / 2
    const halfSpan = ((end - start) * toPixels) / fromPixels / 2
    return [centre - halfSpan, centre + halfSpan]
}

// Before the chart has a size there is no scale to keep; showing the area as it is keeps the window a number.
function windowOf({ x, y, width, height }: Rectangle): AxisWindow {
    return { x: [x, x + width], y: [y, y + height] }
}
