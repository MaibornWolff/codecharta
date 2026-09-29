import { DependencyEdgeType } from "../../../lenses/dependency/dependencyLens.facade"
import { BoxLook, drawBox, drawFolderTitle, drawLevelBand } from "./dependencyGraphBoxes"
import { drawEdge } from "./dependencyGraphEdges"
import { atPaintRank } from "./dependencyGraphElements"
import { boxesByPath, DependencyGraphScene, isEdgeOfHovered, searchMatcher, ToPixels } from "./dependencyGraphScene"
import { GRAPH_SERIES_ID, GraphDatum } from "./dependencyGraphSeries"
import { buildTooltipFormatter } from "./dependencyGraphTooltip"
import { GraphEdge, isShownByFilter } from "./edgeProjection"
import { routeEdges } from "./edgeRouting"
import { DependencyGraphLayout, LayoutBox } from "./levelizedLayout"
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

/** The share of the chart the whole graph takes when it is first shown or the view is reset. */
const FIT_SHARE = 0.94
// Drawn in parts over several frames, the graph would build up box by box on every hover.
const DRAW_EVERYTHING_IN_ONE_FRAME = 0
const NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER = Number.POSITIVE_INFINITY
const EXTENT_ENCODING = { x: [0, 2], y: [1, 3] }

export function buildDependencyGraphOption(scene: DependencyGraphScene, viewport: Viewport) {
    const { layout } = scene
    const byPath = boxesByPath(layout)
    const shownEdges = edgesToDraw(scene)
    const painted = paintOrder(layout, scene.raisedPaths)
    const overlaps = scene.raisedPaths.length > 0 ? findOverlaps(painted) : NO_OVERLAPS
    const isFound = searchMatcher(scene.searchedPaths)
    const lookOfBox = (box: LayoutBox) => lookOf(box, scene, overlaps, isFound(box.path))
    const { underEdges, overEdges } = aroundEdges(painted)
    const items: GraphItem[] = [...underEdges, ...edgeItems(scene, shownEdges, byPath, isFound), ...overEdges]
    return {
        animation: false,
        aria: { enabled: true, label: { description: describeGraph(layout, shownEdges) } },
        hoverLayerThreshold: NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER,
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter(items, byPath) },
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        ...axesFittingTheGraph(layout, viewport),
        dataZoom: [
            { type: "inside", xAxisIndex: 0, filterMode: "none" },
            { type: "inside", yAxisIndex: 0, filterMode: "none" }
        ],
        series: [
            {
                id: GRAPH_SERIES_ID,
                type: "custom",
                data: items.map(item => datumOf(item, byPath)),
                encode: EXTENT_ENCODING,
                renderItem: ({ dataIndex }: RenderParams, api: CoordinateApi) =>
                    atPaintRank(drawItem(items[dataIndex], lookOfBox, overlaps, api.coord), dataIndex),
                progressive: DRAW_EVERYTHING_IN_ONE_FRAME,
                clip: true
            }
        ]
    }
}

/** While a box is hovered, its edges stand out; otherwise the edges between boxes a search missed fade with
 * the boxes. */
function edgeItems(
    scene: DependencyGraphScene,
    shownEdges: GraphEdge[],
    byPath: ReadonlyMap<string, LayoutBox>,
    isFound: (boxPath: string) => boolean
): EdgeItem[] {
    const routes = routeEdges(shownEdges, byPath, scene.edgeStyle)
    const isHoverLit = shownEdges.some(edge => isEdgeOfHovered(edge, scene.hoveredPath))
    const isDimmed = isHoverLit
        ? (edge: GraphEdge) => !isEdgeOfHovered(edge, scene.hoveredPath)
        : (edge: GraphEdge) => !isFound(edge.fromPath) && !isFound(edge.toPath)
    return shownEdges.map((edge, index) => ({ kind: "edge", edge, route: routes[index], isDimmed: isDimmed(edge) }))
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

/** A hovered box shows all its edges whatever the filter, painted over every other edge; otherwise the
 * edges that break the architecture are painted over the ones that follow it. */
function edgesToDraw({ edges, edgeFilter, hoveredPath }: DependencyGraphScene): GraphEdge[] {
    const paintRankOf = (edge: GraphEdge) => PAINT_RANK[edge.type] + (isEdgeOfHovered(edge, hoveredPath) ? HOVERED_PAINT_RANK : 0)
    return edges
        .filter(edge => isShownByFilter(edge.type, edgeFilter) || isEdgeOfHovered(edge, hoveredPath))
        .sort((edgeA, edgeB) => paintRankOf(edgeA) - paintRankOf(edgeB))
}

function drawItem(item: GraphItem, lookOfBox: (box: LayoutBox) => BoxLook, overlaps: Overlaps, toPixels: ToPixels) {
    switch (item.kind) {
        case "box":
            return drawBox(item.box, lookOfBox(item.box), toPixels)
        case "band":
            return drawLevelBand(item.band, toPixels, overlaps.bandCutouts.get(item.band))
        case "title":
            return drawFolderTitle(item.box, lookOfBox(item.box), toPixels)
        default:
            return drawEdge(item.edge, item.route, item.isDimmed, toPixels)
    }
}

function datumOf(item: GraphItem, byPath: ReadonlyMap<string, LayoutBox>): GraphDatum & { value: number[] } {
    switch (item.kind) {
        case "box":
            return { name: item.box.path, value: extentValue(item.box) }
        case "band":
            return { value: extentValue(item.band) }
        case "title":
            return { value: extentValue(item.box) }
        default:
            return { isEdge: true, value: extentValue(spanOf(byPath.get(item.edge.fromPath), byPath.get(item.edge.toPath))) }
    }
}

/** A folder shows what lies behind it where it overlaps something, and while it is dragged. */
function lookOf(box: LayoutBox, scene: DependencyGraphScene, { seeThroughPaths }: Overlaps, isFound: boolean): BoxLook {
    const isDragged = box.isFolder && box.path === scene.draggingPath
    return { emphasis: emphasisOf(box, scene), isSeeThrough: isDragged || seeThroughPaths.has(box.path), isMissedBySearch: !isFound }
}

function emphasisOf(box: LayoutBox, { selectedPath, hoveredPath }: DependencyGraphScene) {
    if (box.path === selectedPath) {
        return "selected"
    }
    return box.path === hoveredPath ? "hovered" : "none"
}

interface Extent {
    x: number
    y: number
    width: number
    height: number
}

function extentValue({ x, y, width, height }: Extent): number[] {
    return [x, y, x + width, y + height]
}

function spanOf(from: LayoutBox, to: LayoutBox): Extent {
    const x = Math.min(from.x, to.x)
    const y = Math.min(from.y, to.y)
    return { x, y, width: Math.max(from.x + from.width, to.x + to.width) - x, height: Math.max(from.y + from.height, to.y + to.height) - y }
}

/** The two ends of each axis in layout units, as far as the chart shows them. */
export interface AxisWindow {
    x: [number, number]
    y: [number, number]
}

/** The axes reach the laid-out graph plus this share of its size on every side, room that dragged boxes can
 * grow the graph into and still be panned to. The axes stay put while boxes move, so a drag never shifts the
 * view under the pointer. */
const DRAGGING_ROOM_SHARE = 1

function axesFittingTheGraph(layout: DependencyGraphLayout, viewport: Viewport) {
    const room = Math.max(layout.width, layout.height) * DRAGGING_ROOM_SHARE
    const reach = windowAround({ x: -room, y: -room, width: layout.width + 2 * room, height: layout.height + 2 * room }, viewport, 1)
    return {
        xAxis: { type: "value", show: false, min: reach.x[0], max: reach.x[1] },
        yAxis: { type: "value", show: false, inverse: true, min: reach.y[0], max: reach.y[1] }
    }
}

/** The window that shows the whole graph as it is drawn, dragged boxes and the folders they grew included. */
export function fitWindowOf(layout: DependencyGraphLayout, viewport: Viewport): AxisWindow {
    const [root] = layout.boxes
    return windowAround(root ?? { x: 0, y: 0, width: layout.width, height: layout.height }, viewport, FIT_SHARE)
}

/** Centres the area and gives both axes the same number of pixels per layout unit, so the graph is never
 * squashed. */
function windowAround(area: Extent, viewport: Viewport, share: number): AxisWindow {
    const pixelsPerUnit = Math.min(viewport.width / area.width, viewport.height / area.height) * share
    const halfWidth = viewport.width / pixelsPerUnit / 2
    const halfHeight = viewport.height / pixelsPerUnit / 2
    const centreX = area.x + area.width / 2
    const centreY = area.y + area.height / 2
    return { x: [centreX - halfWidth, centreX + halfWidth], y: [centreY - halfHeight, centreY + halfHeight] }
}

function describeGraph(layout: DependencyGraphLayout, shownEdges: GraphEdge[]): string {
    const fileCount = layout.boxes.filter(box => !box.isFolder).length
    return `Dependency graph with ${fileCount} files and ${shownEdges.length} edges shown, arranged in rows by level.`
}
