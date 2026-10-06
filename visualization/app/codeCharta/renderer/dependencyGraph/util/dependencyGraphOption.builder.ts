import { DependencyEdgeType } from "../../../model/dependencyGraph.model"
import { nestingOf } from "./boxNesting"
import { minOf } from "./collections"
import { BoxLook, drawBox, drawContainerTitle, drawLevelBand } from "./dependencyGraphBoxes"
import { drawEdge } from "./dependencyGraphEdges"
import { atPaintRank } from "./dependencyGraphElements"
import { boxesByPath, DependencyGraphScene, isEdgeInFocus, isEdgeOfHovered, searchMatcher, ToPixels } from "./dependencyGraphScene"
import { GRAPH_SERIES_ID, GraphDatum } from "./dependencyGraphSeries"
import { edgeColorsAsDrawn } from "./dependencyGraphStyle"
import { buildTooltipFormatter } from "./dependencyGraphTooltip"
import { GraphEdge } from "./edgeProjection"
import { routeEdges } from "./edgeRouting"
import { edgeWidthPx } from "./edgeWidth"
import { enclosingRectangle, Rectangle } from "./geometry"
import { canBeOpened, DependencyGraphLayout, LayoutBox } from "./levelizedLayout"
import { lineStyleOf } from "./lineStyle"
import { findOverlaps, NO_OVERLAPS, Overlaps } from "./overlaps"
import { aroundEdges, EdgeItem, GraphItem, paintOrder } from "./paintOrder"

export interface Viewport {
    width: number
    height: number
}

interface RenderParams {
    dataIndex: number
}

interface CoordinateApi {
    coord: ToPixels
}

const FIT_SHARE = 0.94
// Drawn in parts over several frames, the graph would build up box by box on every hover.
const DRAW_EVERYTHING_IN_ONE_FRAME = 0
const NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER = Number.POSITIVE_INFINITY
const EXTENT_ENCODING = { x: [0, 2], y: [1, 3] }

interface DrawableGraph {
    items: GraphItem[]
    draw: (item: GraphItem, toPixels: ToPixels) => ReturnType<typeof drawItem>
}

export function buildDependencyGraphOption(scene: DependencyGraphScene, viewport: Viewport, shownWindow: AxisWindow) {
    const byPath = boxesByPath(scene.layout)
    const isInside = nestingOf(scene.layout.boxes)
    const isOfHovered: EdgeTest = edge => isEdgeOfHovered(edge, scene.hoveredPath, isInside)
    const shownEdges = edgesToDraw(scene, isOfHovered)
    const graph = drawableGraph(scene, shownEdges, { byPath, isOfHovered })
    return {
        animation: false,
        aria: { enabled: true, label: { description: describeGraph(scene.layout, shownEdges) } },
        hoverLayerThreshold: NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER,
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter(graph.items, byPath, scene) },
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        ...axesReaching(scene.layout, viewport, shownWindow),
        dataZoom: zoomBothAxesInsideTo(shownWindow),
        series: [graphSeries(graph, byPath)]
    }
}

type EdgeTest = (edge: GraphEdge) => boolean

interface EdgeContext {
    byPath: ReadonlyMap<string, LayoutBox>
    isOfHovered: EdgeTest
}

function drawableGraph(scene: DependencyGraphScene, shownEdges: GraphEdge[], context: EdgeContext): DrawableGraph {
    const painted = paintOrder(scene.layout, scene.raisedPaths)
    const overlaps = scene.raisedPaths.length > 0 ? findOverlaps(painted) : NO_OVERLAPS
    const isFound = searchMatcher(scene.searchedPaths, scene.layout.boxes)
    const lookOfBox = (box: LayoutBox) => lookOf(box, scene, overlaps, isFound(box.path))
    const { underEdges, overEdges } = aroundEdges(painted)
    const isDimmed = dimmerOf(scene, shownEdges, { isFound, isOfHovered: context.isOfHovered })
    return {
        items: [...underEdges, ...edgeItems(scene, shownEdges, context.byPath, isDimmed), ...overEdges],
        draw: (item, toPixels) => drawItem(item, lookOfBox, overlaps, toPixels)
    }
}

function graphSeries({ items, draw }: DrawableGraph, byPath: ReadonlyMap<string, LayoutBox>) {
    return {
        id: GRAPH_SERIES_ID,
        type: "custom",
        data: items.map(item => datumOf(item, byPath)),
        encode: EXTENT_ENCODING,
        renderItem: ({ dataIndex }: RenderParams, api: CoordinateApi) => atPaintRank(draw(items[dataIndex], api.coord), dataIndex),
        progressive: DRAW_EVERYTHING_IN_ONE_FRAME,
        clip: true
    }
}

function edgeItems(
    scene: DependencyGraphScene,
    shownEdges: GraphEdge[],
    byPath: ReadonlyMap<string, LayoutBox>,
    isDimmed: EdgeTest
): EdgeItem[] {
    const routes = routeEdges(shownEdges, byPath, scene.edgeStyle, scene.isAnchoredAtSideMiddle)
    const lightestWeight = minOf(shownEdges.map(edge => edge.weight))
    const colors = edgeColorsAsDrawn(scene.edgeColors, scene.lineStyleShows)
    return shownEdges.map((edge, index) => ({
        kind: "edge",
        edge,
        route: routes[index],
        look: {
            isDimmed: isDimmed(edge),
            isSelected: edge.id === scene.selectedEdgeId,
            widthPx: edgeWidthPx(edge.weight / lightestWeight, scene.edgeWidth),
            color: colors[edge.type],
            line: lineStyleOf(edge, scene.lineStyleShows)
        }
    }))
}

/** The edges the reader points at stand out against all others; without any, those of the hovered box do, and
 * without a hover, those a search found. */
function dimmerOf(scene: DependencyGraphScene, shownEdges: GraphEdge[], { isFound, isOfHovered }: Dimming): EdgeTest {
    if (scene.highlightedEdgeIds.size > 0) {
        return edge => !isEdgeInFocus(edge, scene)
    }
    if (shownEdges.some(isOfHovered)) {
        return edge => !isOfHovered(edge) && !isEdgeInFocus(edge, scene)
    }
    return edge => !isFound(edge.fromPath) && !isFound(edge.toPath) && !isEdgeInFocus(edge, scene)
}

interface Dimming {
    isFound: (boxPath: string) => boolean
    isOfHovered: EdgeTest
}

/** Painted in rising order: edges often share a corridor, and one red edge painted under fifteen grey ones
 * could not be seen at all. */
const PAINT_RANK: Record<DependencyEdgeType, number> = {
    regular: 0,
    cyclic: 1,
    feedbackContainerLevel: 2,
    feedbackLeafLevel: 3
}
const HOVERED_PAINT_RANK = Object.keys(PAINT_RANK).length

function edgesToDraw(scene: DependencyGraphScene, isOfHovered: EdgeTest): GraphEdge[] {
    const isRaised: EdgeTest = edge => isOfHovered(edge) || isEdgeInFocus(edge, scene)
    const paintRankOf = (edge: GraphEdge) => PAINT_RANK[edge.type] + (isRaised(edge) ? HOVERED_PAINT_RANK : 0)
    return scene.edges
        .filter(edge => scene.shownEdgeTypes.includes(edge.type) || isRaised(edge))
        .sort((edgeA, edgeB) => paintRankOf(edgeA) - paintRankOf(edgeB))
}

function drawItem(item: GraphItem, lookOfBox: (box: LayoutBox) => BoxLook, overlaps: Overlaps, toPixels: ToPixels) {
    switch (item.kind) {
        case "box":
            return drawBox(item.box, lookOfBox(item.box), toPixels)
        case "band":
            return drawLevelBand(item.band, toPixels, overlaps.bandCutouts.get(item.band))
        case "title":
            return drawContainerTitle(item.box, lookOfBox(item.box), toPixels)
        default:
            return drawEdge(item.route, item.look, toPixels)
    }
}

function datumOf(item: GraphItem, byPath: ReadonlyMap<string, LayoutBox>): GraphDatum & { value: number[] } {
    switch (item.kind) {
        case "box":
            return { name: item.box.path, value: extentValue(item.box) }
        case "band":
            return { value: extentValue(item.band) }
        case "title":
            return { titledBoxPath: item.box.path, value: extentValue(item.box) }
        default:
            return {
                isEdge: true,
                edgeId: item.edge.id,
                value: extentValue(enclosingRectangle([byPath.get(item.edge.fromPath), byPath.get(item.edge.toPath)]))
            }
    }
}

function lookOf(box: LayoutBox, scene: DependencyGraphScene, { seeThroughPaths }: Overlaps, isFound: boolean): BoxLook {
    const isDragged = canBeOpened(box) && box.path === scene.draggingPath
    return {
        emphasis: emphasisOf(box, scene),
        isSeeThrough: isDragged || seeThroughPaths.has(box.path),
        isMissedBySearch: !isFound,
        kindMark: scene.declarationKindMark,
        cycle: {
            hiddenCount: scene.cycleMarks.hiddenCycles.get(box.path) ?? 0,
            isInCycle: scene.cycleMarks.declarationsInCycles.has(box.path),
            color: scene.edgeColors.cyclic
        }
    }
}

function emphasisOf(box: LayoutBox, { selectedPath, hoveredPath }: DependencyGraphScene) {
    if (box.path === selectedPath) {
        return "selected"
    }
    return box.path === hoveredPath ? "hovered" : "none"
}

function extentValue({ x, y, width, height }: Rectangle): number[] {
    return [x, y, x + width, y + height]
}

/** In layout units. */
export interface AxisWindow {
    x: [number, number]
    y: [number, number]
}

/** The axes reach the laid-out graph plus this share of its size on every side, room that dragged boxes can
 * grow the graph into and still be panned to. */
const DRAGGING_ROOM_SHARE = 1

function axesReaching(layout: DependencyGraphLayout, viewport: Viewport, shownWindow: AxisWindow) {
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
function zoomBothAxesInsideTo({ x, y }: AxisWindow) {
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

function describeGraph(layout: DependencyGraphLayout, shownEdges: GraphEdge[]): string {
    const fileCount = layout.boxes.filter(box => box.kind === "file").length
    return `Dependency graph with ${fileCount} files and ${shownEdges.length} edges shown, arranged in rows by level.`
}
