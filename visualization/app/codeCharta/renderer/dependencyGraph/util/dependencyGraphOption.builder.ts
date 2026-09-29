import { DependencyEdgeType } from "../../../lenses/dependency/dependencyLens.facade"
import { drawBox, drawLevelBand } from "./dependencyGraphBoxes"
import { drawEdge } from "./dependencyGraphEdges"
import { boxesByPath, DependencyGraphScene, isEdgeOfHovered, ToPixels } from "./dependencyGraphScene"
import { GRAPH_SERIES_ID, GraphDatum } from "./dependencyGraphSeries"
import { buildTooltipFormatter } from "./dependencyGraphTooltip"
import { GraphEdge, isShownByFilter } from "./edgeProjection"
import { routeEdges } from "./edgeRouting"
import { DependencyGraphLayout, LayoutBox } from "./levelizedLayout"
import { EdgeItem, GraphItem, paintOrder, withEdges } from "./paintOrder"

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
    const items = withEdges(paintOrder(layout, scene.raisedPaths), edgeItems(scene, shownEdges, byPath))
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
                renderItem: ({ dataIndex }: RenderParams, api: CoordinateApi) => drawItem(items[dataIndex], scene, api.coord),
                progressive: DRAW_EVERYTHING_IN_ONE_FRAME,
                clip: true
            }
        ]
    }
}

function edgeItems(scene: DependencyGraphScene, shownEdges: GraphEdge[], byPath: ReadonlyMap<string, LayoutBox>): EdgeItem[] {
    const routes = routeEdges(shownEdges, byPath, scene.edgeStyle)
    const isHoverLit = shownEdges.some(edge => isEdgeOfHovered(edge, scene.hoveredPath))
    return shownEdges.map((edge, index) => {
        const isOfHovered = isEdgeOfHovered(edge, scene.hoveredPath)
        return { kind: "edge", edge, route: routes[index], isDimmed: isHoverLit && !isOfHovered, isOnTop: isOfHovered }
    })
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

function drawItem(item: GraphItem, scene: DependencyGraphScene, toPixels: ToPixels) {
    switch (item.kind) {
        case "box":
            return drawBox(item.box, emphasisOf(item.box, scene), toPixels)
        case "band":
            return drawLevelBand(item.band, toPixels)
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
        default:
            return { isEdge: true, value: extentValue(spanOf(byPath.get(item.edge.fromPath), byPath.get(item.edge.toPath))) }
    }
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

/** Both axes get the same number of pixels per layout unit, so zooming both together never squashes the
 * graph, and the whole graph sits centred in the chart. */
function axesFittingTheGraph(layout: DependencyGraphLayout, viewport: Viewport) {
    const pixelsPerUnit = Math.min(viewport.width / layout.width, viewport.height / layout.height) * FIT_SHARE
    const halfWidth = viewport.width / pixelsPerUnit / 2
    const halfHeight = viewport.height / pixelsPerUnit / 2
    return {
        xAxis: { type: "value", show: false, min: layout.width / 2 - halfWidth, max: layout.width / 2 + halfWidth },
        yAxis: { type: "value", show: false, inverse: true, min: layout.height / 2 - halfHeight, max: layout.height / 2 + halfHeight }
    }
}

function describeGraph(layout: DependencyGraphLayout, shownEdges: GraphEdge[]): string {
    const fileCount = layout.boxes.filter(box => !box.isFolder).length
    return `Dependency graph with ${fileCount} files and ${shownEdges.length} edges shown, arranged in rows by level.`
}
