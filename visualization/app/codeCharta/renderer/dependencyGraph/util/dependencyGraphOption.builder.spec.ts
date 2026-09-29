import { buildDependencyGraphOption } from "./dependencyGraphOption.builder"
import { DependencyGraphScene } from "./dependencyGraphScene"
import { SERIES_IDS } from "./dependencyGraphSeries"
import { aBand, aBox, anEdge, identityPixels } from "./dependencyGraphTestData"

interface BuiltSeries {
    id: string
    data: { name?: string; value: number[] }[]
    renderItem: (params: { dataIndex: number }, api: { coord: typeof identityPixels }) => { children: { style: Record<string, unknown> }[] }
}

const root = aBox("/root", { isFolder: true, isExpanded: true, depth: 0, width: 400, height: 200 })
const view = aBox("/root/view.ts", { x: 16, y: 44 })
const model = aBox("/root/model.ts", { x: 16, y: 120 })
const util = aBox("/root/util.ts", { x: 200, y: 120 })

function sceneWith(overrides: Partial<DependencyGraphScene> = {}): DependencyGraphScene {
    return {
        layout: { boxes: [root, view, model, util], bands: [aBand()], width: 400, height: 200 },
        edges: [anEdge(view.path, model.path), anEdge(util.path, view.path, { type: "feedbackContainerLevel" })],
        edgeFilter: "all",
        edgeStyle: "curved",
        hoveredPath: null,
        selectedPath: null,
        ...overrides
    }
}

function seriesOf(option: ReturnType<typeof buildDependencyGraphOption>, id: string): BuiltSeries {
    return option.series.find(series => series.id === id) as unknown as BuiltSeries
}

describe("buildDependencyGraphOption", () => {
    it("should give both axes the same scale and centre the graph", () => {
        // Arrange
        const viewport = { width: 1000, height: 400 }

        // Act
        const { xAxis, yAxis } = buildDependencyGraphOption(sceneWith(), viewport)

        // Assert
        expect((xAxis.max - xAxis.min) / viewport.width).toBeCloseTo((yAxis.max - yAxis.min) / viewport.height)
        expect((xAxis.max + xAxis.min) / 2).toBe(200)
        expect(yAxis.inverse).toBe(true)
    })

    it("should draw only the edges the filter lets through", () => {
        // Arrange
        const scene = sceneWith({ edgeFilter: "feedback" })

        // Act
        const edges = seriesOf(buildDependencyGraphOption(scene, { width: 800, height: 600 }), SERIES_IDS.edges)

        // Assert
        expect(edges.data).toHaveLength(1)
    })

    it("should draw every edge of the hovered box, whatever the filter, and dim the rest", () => {
        // Arrange
        const scene = sceneWith({ edgeFilter: "none", hoveredPath: model.path })

        // Act
        const edges = seriesOf(buildDependencyGraphOption(scene, { width: 800, height: 600 }), SERIES_IDS.edges)

        // Assert
        expect(edges.data).toHaveLength(1)
        expect(edges.renderItem({ dataIndex: 0 }, { coord: identityPixels }).children[0].style.opacity).toBe(1)
    })

    it("should mark the selected and the hovered box", () => {
        // Arrange
        const scene = sceneWith({ selectedPath: view.path, hoveredPath: model.path })

        // Act
        const boxes = seriesOf(buildDependencyGraphOption(scene, { width: 800, height: 600 }), SERIES_IDS.boxes)

        // Assert
        const strokeWidthOf = (dataIndex: number) => boxes.renderItem({ dataIndex }, { coord: identityPixels }).children[0].style.lineWidth
        expect([0, 1, 2].map(strokeWidthOf)).toEqual([2.5, 2, 1])
    })

    it("should describe boxes and edges in the tooltip", () => {
        // Arrange
        const option = buildDependencyGraphOption(sceneWith(), { width: 800, height: 600 })

        // Act
        const folderText = option.tooltip.formatter({ seriesId: SERIES_IDS.openFolders, dataIndex: 0 })
        const fileText = option.tooltip.formatter({ seriesId: SERIES_IDS.boxes, dataIndex: 0 })
        const edgeText = option.tooltip.formatter({ seriesId: SERIES_IDS.edges, dataIndex: 1 })
        const levelText = option.tooltip.formatter({ seriesId: SERIES_IDS.levels, dataIndex: 0 })

        // Assert
        expect(folderText).toBe("<b>/root</b><br/>Level 0<br/><i>Double-click to close</i>")
        expect(fileText).toBe("<b>/root/view.ts</b><br/>Level 0")
        expect(levelText).toBe("")
        expect(edgeText).toBe("<b>util.ts → view.ts</b><br/>1 dependency · Points upward")
    })

    it("should draw the level bands", () => {
        // Arrange
        const option = buildDependencyGraphOption(sceneWith(), { width: 800, height: 600 })

        // Act
        const levels = seriesOf(option, SERIES_IDS.levels)

        // Assert
        expect(levels.renderItem({ dataIndex: 0 }, { coord: identityPixels }).children[0].style.text).toBe("level 1")
    })

    it("should paint open folders at the back and files on top of the edges, each named by its path", () => {
        // Arrange
        const option = buildDependencyGraphOption(sceneWith(), { width: 800, height: 600 })

        // Act
        const seriesIds = option.series.map(series => series.id)

        // Assert
        expect(seriesIds).toEqual([SERIES_IDS.openFolders, SERIES_IDS.levels, SERIES_IDS.edges, SERIES_IDS.boxes])
        expect(seriesOf(option, SERIES_IDS.openFolders).data.map(item => item.name)).toEqual(["/root"])
        expect(seriesOf(option, SERIES_IDS.boxes).data.map(item => item.name)).toEqual(["/root/view.ts", "/root/model.ts", "/root/util.ts"])
    })

    it("should keep ECharts from lifting a hovered item over the rest, so an open folder never covers its children", () => {
        // Arrange
        const option = buildDependencyGraphOption(sceneWith({ hoveredPath: view.path }), { width: 800, height: 600 })

        // Act
        const drawnItems = option.series.map(series =>
            (series as unknown as BuiltSeries).renderItem({ dataIndex: 0 }, { coord: identityPixels })
        )

        // Assert
        expect(drawnItems.map(item => (item as unknown as { emphasisDisabled: boolean }).emphasisDisabled)).toEqual([
            true,
            true,
            true,
            true
        ])
    })

    it("should paint the edges that break the architecture over the ones that follow it, and the hovered box's edges over all", () => {
        // Arrange
        const edges = [
            anEdge(view.path, util.path, { type: "feedbackLeafLevel" }),
            anEdge(util.path, model.path, { type: "feedbackContainerLevel" }),
            anEdge(model.path, util.path, { type: "cyclic" }),
            anEdge(view.path, model.path)
        ]
        const scene = sceneWith({ edges, hoveredPath: null })
        const hoveredScene = sceneWith({ edges, hoveredPath: model.path })

        // Act
        const paintOrder = buildDependencyGraphOption(scene, { width: 800, height: 600 }).tooltip.formatter
        const hoveredPaintOrder = buildDependencyGraphOption(hoveredScene, { width: 800, height: 600 }).tooltip.formatter

        // Assert
        const typesIn = (formatter: typeof paintOrder) =>
            [0, 1, 2, 3].map(dataIndex => formatter({ seriesId: SERIES_IDS.edges, dataIndex }).split(" · ")[1])
        expect(typesIn(paintOrder)).toEqual(["Dependency", "In a cycle", "Points upward", "Points upward and closes a cycle"])
        expect(typesIn(hoveredPaintOrder)).toEqual(["Points upward and closes a cycle", "Dependency", "In a cycle", "Points upward"])
    })

    it("should light up only the edges crossing a hovered folder's border", () => {
        // Arrange
        const folder = aBox("/root/app", { isFolder: true, isExpanded: true, width: 400, height: 200 })
        const inside = aBox("/root/app/a.ts")
        const alsoInside = aBox("/root/app/b.ts", { y: 100 })
        const outside = aBox("/root/lib.ts", { y: 300 })
        const edges = [anEdge(inside.path, alsoInside.path), anEdge(inside.path, outside.path)]
        const scene = sceneWith({
            layout: { boxes: [root, folder, inside, alsoInside, outside], bands: [], width: 400, height: 400 },
            edges,
            edgeFilter: "none",
            hoveredPath: folder.path
        })

        // Act
        const drawn = seriesOf(buildDependencyGraphOption(scene, { width: 800, height: 600 }), SERIES_IDS.edges)

        // Assert
        expect(drawn.data).toHaveLength(1)
        expect(drawn.renderItem({ dataIndex: 0 }, { coord: identityPixels }).children[0].style.opacity).toBe(1)
    })

    it("should dim nothing while the hovered box has no edge crossing its border, as the root never has", () => {
        // Arrange
        const scene = sceneWith({ hoveredPath: root.path })

        // Act
        const drawn = seriesOf(buildDependencyGraphOption(scene, { width: 800, height: 600 }), SERIES_IDS.edges)

        // Assert
        const opacities = drawn.data.map(
            (_, dataIndex) => drawn.renderItem({ dataIndex }, { coord: identityPixels }).children[0].style.opacity
        )
        expect(opacities).toEqual([1, 1])
    })
})
