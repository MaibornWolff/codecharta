import { DependencyEdgeType } from "../../../model/dependencyGraph.model"
import { AxisWindow, axesReaching, Viewport, zoomBothAxesInsideTo } from "./axisWindow"
import { IsInside } from "./boxNesting"
import { minOf } from "./collections"
import { BoxLook, drawBox, drawContainerTitle, drawLevelBand } from "./dependencyGraphBoxes"
import { drawEdge } from "./dependencyGraphEdges"
import { atPaintRank } from "./dependencyGraphElements"
import { DependencyGraphScene, isEdgeInFocus, isEdgeOfHovered, searchMatcher, ToPixels } from "./dependencyGraphScene"
import { GRAPH_SERIES_ID, GraphDatum } from "./dependencyGraphSeries"
import { edgeColorsAsDrawn } from "./dependencyGraphStyle"
import { buildTooltipFormatter } from "./dependencyGraphTooltip"
import { GraphEdge } from "./edgeProjection"
import { routeEdges } from "./edgeRouting"
import { edgeWidthPx } from "./edgeWidth"
import { enclosingRectangle, Rectangle } from "./geometry"
import { lookupsOf } from "./layoutLookups"
import { canBeOpened, DependencyGraphLayout, LayoutBox } from "./layoutModel"
import { lineStyleOf } from "./lineStyle"
import { findOverlaps, NO_OVERLAPS, Overlaps } from "./overlaps"
import { aroundEdges, EdgeItem, GraphItem, paintOrder } from "./paintOrder"

interface RenderParams {
    dataIndex: number
}

interface CoordinateApi {
    coord: ToPixels
}

// Drawn in parts over several frames, the graph would build up box by box on every hover.
const DRAW_EVERYTHING_IN_ONE_FRAME = 0
const NEVER_DRAW_HOVER_ON_ITS_OWN_LAYER = Number.POSITIVE_INFINITY
const EXTENT_ENCODING = { x: [0, 2], y: [1, 3] }

interface DrawableGraph {
    items: GraphItem[]
    draw: (item: GraphItem, toPixels: ToPixels) => ReturnType<typeof drawItem>
}

export function buildDependencyGraphOption(scene: DependencyGraphScene, viewport: Viewport, shownWindow: AxisWindow) {
    const { byPath, isInside } = lookupsOf(scene.layout)
    const isOfHovered: EdgeTest = edge => isEdgeOfHovered(edge, scene.hoveredPath, isInside)
    const shownEdges = edgesToDraw(scene, isOfHovered)
    const graph = drawableGraph(scene, shownEdges, { byPath, isInside, isOfHovered })
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
    isInside: IsInside
    isOfHovered: EdgeTest
}

function drawableGraph(scene: DependencyGraphScene, shownEdges: GraphEdge[], context: EdgeContext): DrawableGraph {
    const painted = paintOrder(scene.layout, scene.raisedPaths)
    const overlaps = scene.raisedPaths.length > 0 ? findOverlaps(painted, context.isInside) : NO_OVERLAPS
    const isFound = searchMatcher(scene.searchedPaths, context.byPath)
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
    const raised = new Set(scene.edges.filter(edge => isOfHovered(edge) || isEdgeInFocus(edge, scene)))
    const paintRankOf = (edge: GraphEdge) => PAINT_RANK[edge.type] + (raised.has(edge) ? HOVERED_PAINT_RANK : 0)
    return scene.edges
        .filter(edge => scene.shownEdgeTypes.includes(edge.type) || raised.has(edge))
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
        listsLevels: scene.declarationArrangement === "list",
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

function describeGraph(layout: DependencyGraphLayout, shownEdges: GraphEdge[]): string {
    const fileCount = layout.boxes.filter(box => box.kind === "file").length
    return `Dependency graph with ${fileCount} files and ${shownEdges.length} edges shown, arranged in rows by level.`
}
