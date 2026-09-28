import { DependencyEdgeType } from "../../../lenses/dependency/dependencyLens.facade"
import { drawBox, drawLevelBand } from "./dependencyGraphBoxes"
import { drawEdge } from "./dependencyGraphEdges"
import { boxesByPath, DependencyGraphScene, isEdgeOfHovered, ToPixels } from "./dependencyGraphScene"
import { SERIES_IDS } from "./dependencyGraphSeries"
import { buildTooltipFormatter } from "./dependencyGraphTooltip"
import { GraphEdge, isShownByFilter } from "./edgeProjection"
import { DependencyGraphLayout, LayoutBox } from "./levelizedLayout"

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
    const openFolders = layout.boxes.filter(box => box.isExpanded)
    const closedBoxes = layout.boxes.filter(box => !box.isExpanded)
    const boxSeries = (id: string, boxes: LayoutBox[]) =>
        customSeries(id, boxes, ({ dataIndex }, api) => drawBox(boxes[dataIndex], emphasisOf(boxes[dataIndex], scene), api.coord))
    return {
        animation: false,
        aria: { enabled: true, label: { description: describeGraph(layout, shownEdges) } },
        hoverLayerThreshold: NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER,
        tooltip: { show: true, confine: true, formatter: buildTooltipFormatter({ openFolders, closedBoxes, shownEdges, byPath }) },
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        ...axesFittingTheGraph(layout, viewport),
        dataZoom: [
            { type: "inside", xAxisIndex: 0, filterMode: "none" },
            { type: "inside", yAxisIndex: 0, filterMode: "none" }
        ],
        series: [
            boxSeries(SERIES_IDS.openFolders, openFolders),
            {
                ...customSeries(SERIES_IDS.levels, layout.bands, ({ dataIndex }, api) => drawLevelBand(layout.bands[dataIndex], api.coord)),
                silent: true
            },
            customSeries(
                SERIES_IDS.edges,
                shownEdges.map(edge => spanOf(byPath.get(edge.fromPath), byPath.get(edge.toPath))),
                ({ dataIndex }, api) => {
                    const edge = shownEdges[dataIndex]
                    const isDimmed = scene.hoveredPath !== null && !isEdgeOfHovered(edge, scene.hoveredPath)
                    return drawEdge(edge, byPath.get(edge.fromPath), byPath.get(edge.toPath), isDimmed, api.coord)
                }
            ),
            boxSeries(SERIES_IDS.boxes, closedBoxes)
        ]
    }
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
    /** Reported back by the chart's events, so a click names the box it hit. */
    path?: string
}

function customSeries(id: string, items: Extent[], renderItem: (params: RenderParams, api: CoordinateApi) => object) {
    return {
        id,
        type: "custom",
        data: items.map(({ x, y, width, height, path }) => ({ name: path, value: [x, y, x + width, y + height] })),
        encode: EXTENT_ENCODING,
        renderItem,
        progressive: DRAW_EVERYTHING_IN_ONE_FRAME,
        clip: true
    }
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
