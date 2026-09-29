import { buildDependencyGraphOption } from "./dependencyGraphOption.builder"
import { DependencyGraphScene } from "./dependencyGraphScene"
import { GRAPH_SERIES_ID } from "./dependencyGraphSeries"
import { aBand, aBox, anEdge, identityPixels } from "./dependencyGraphTestData"

interface DrawnElement {
    emphasisDisabled?: boolean
    children: { style: Record<string, unknown> }[]
}

interface BuiltSeries {
    id: string
    data: { name?: string; isEdge?: boolean; value: number[] }[]
    renderItem: (params: { dataIndex: number }, api: { coord: typeof identityPixels }) => DrawnElement
}

const root = aBox("/root", { isFolder: true, isExpanded: true, depth: 0, width: 400, height: 200 })
const view = aBox("/root/view.ts", { x: 16, y: 44 })
const model = aBox("/root/model.ts", { x: 16, y: 120 })
const util = aBox("/root/util.ts", { x: 200, y: 120 })
const VIEWPORT = { width: 800, height: 600 }

function sceneWith(overrides: Partial<DependencyGraphScene> = {}): DependencyGraphScene {
    return {
        layout: { boxes: [root, view, model, util], bands: [aBand()], width: 400, height: 200 },
        edges: [anEdge(view.path, model.path), anEdge(util.path, view.path, { type: "feedbackContainerLevel" })],
        edgeFilter: "all",
        edgeStyle: "curved",
        raisedPaths: [],
        hoveredPath: null,
        selectedPath: null,
        ...overrides
    }
}

function drawnGraph(scene: DependencyGraphScene) {
    const option = buildDependencyGraphOption(scene, VIEWPORT)
    const series = option.series[0] as unknown as BuiltSeries
    const edgeIndices = series.data.flatMap((datum, index) => (datum.isEdge ? [index] : []))
    return {
        option,
        series,
        edgeIndices,
        indexOf: (path: string) => series.data.findIndex(datum => datum.name === path),
        draw: (dataIndex: number) => series.renderItem({ dataIndex }, { coord: identityPixels }),
        describe: (dataIndex: number) => option.tooltip.formatter({ dataIndex })
    }
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

    it("should draw boxes, level bands and edges as one series in paint order, each edge right after its later end", () => {
        // Act
        const { option, series } = drawnGraph(sceneWith())

        // Assert
        expect(option.series.map(built => built.id)).toEqual([GRAPH_SERIES_ID])
        expect(series.data.map(datum => datum.name ?? (datum.isEdge ? "edge" : "band"))).toEqual([
            "/root",
            "band",
            "/root/view.ts",
            "/root/model.ts",
            "edge",
            "/root/util.ts",
            "edge"
        ])
    })

    it("should paint a covered folder's edges under the folder covering it", () => {
        // Arrange
        const covered = aBox("/root/covered", { isFolder: true, isExpanded: true, depth: 1, width: 300, height: 150 })
        const inside = aBox("/root/covered/a.ts", { depth: 2 })
        const alsoInside = aBox("/root/covered/b.ts", { depth: 2, y: 80 })
        const covering = aBox("/root/covering", { isFolder: true, isExpanded: true, depth: 1, width: 300, height: 150 })
        const layout = { boxes: [root, covered, inside, alsoInside, covering], bands: [], width: 400, height: 200 }
        const edges = [anEdge(inside.path, alsoInside.path)]

        // Act
        const underneath = drawnGraph(sceneWith({ layout, edges }))
        const raised = drawnGraph(sceneWith({ layout, edges, raisedPaths: [covered.path] }))

        // Assert
        expect(underneath.edgeIndices[0]).toBeLessThan(underneath.indexOf(covering.path))
        expect(raised.edgeIndices[0]).toBeGreaterThan(raised.indexOf(covering.path))
    })

    it("should draw only the edges the filter lets through", () => {
        // Act
        const { edgeIndices } = drawnGraph(sceneWith({ edgeFilter: "feedback" }))

        // Assert
        expect(edgeIndices).toHaveLength(1)
    })

    it("should draw every edge of the hovered box on top, whatever the filter", () => {
        // Act
        const { edgeIndices, series, draw } = drawnGraph(sceneWith({ edgeFilter: "none", hoveredPath: model.path }))

        // Assert
        expect(edgeIndices).toEqual([series.data.length - 1])
        expect(draw(edgeIndices[0]).children[0].style.opacity).toBe(1)
    })

    it("should mark the selected and the hovered box", () => {
        // Act
        const { indexOf, draw } = drawnGraph(sceneWith({ selectedPath: view.path, hoveredPath: model.path }))

        // Assert
        const strokeWidthOf = (path: string) => draw(indexOf(path)).children[0].style.lineWidth
        expect([view.path, model.path, util.path].map(strokeWidthOf)).toEqual([2.5, 2, 1])
    })

    it("should describe boxes and edges in the tooltip, and nothing for a level band", () => {
        // Act
        const { describe, edgeIndices } = drawnGraph(sceneWith())

        // Assert
        expect(describe(0)).toBe("<b>/root</b><br/>Level 0<br/><i>Double-click to close</i>")
        expect(describe(1)).toBe("")
        expect(describe(2)).toBe("<b>/root/view.ts</b><br/>Level 0")
        expect(describe(edgeIndices[1])).toBe("<b>util.ts → view.ts</b><br/>1 dependency · Points upward")
    })

    it("should draw the level bands", () => {
        // Act
        const { draw } = drawnGraph(sceneWith())

        // Assert
        expect(draw(1).children[0].style.text).toBe("level 1")
    })

    it("should keep ECharts from lifting a hovered item over the rest, so an open folder never covers its children", () => {
        // Act
        const { series, draw } = drawnGraph(sceneWith({ hoveredPath: view.path }))

        // Assert
        expect(series.data.map((_, index) => draw(index).emphasisDisabled)).toEqual(series.data.map(() => true))
    })

    it("should paint the edges that break the architecture over the ones that follow it, and the hovered box's edges over all", () => {
        // Arrange
        const edges = [
            anEdge(view.path, util.path, { type: "feedbackLeafLevel" }),
            anEdge(util.path, model.path, { type: "feedbackContainerLevel" }),
            anEdge(model.path, util.path, { type: "cyclic" }),
            anEdge(view.path, model.path)
        ]

        // Act
        const plain = drawnGraph(sceneWith({ edges }))
        const hovered = drawnGraph(sceneWith({ edges, hoveredPath: model.path }))

        // Assert
        const typesIn = ({ edgeIndices, describe }: ReturnType<typeof drawnGraph>) =>
            edgeIndices.map(index => describe(index).split(" · ")[1])
        expect(typesIn(plain)).toEqual(["Dependency", "In a cycle", "Points upward", "Points upward and closes a cycle"])
        expect(typesIn(hovered)).toEqual(["Points upward and closes a cycle", "Dependency", "In a cycle", "Points upward"])
    })

    it("should light up only the edges crossing a hovered folder's border", () => {
        // Arrange
        const folder = aBox("/root/app", { isFolder: true, isExpanded: true, width: 400, height: 200 })
        const inside = aBox("/root/app/a.ts", { depth: 2 })
        const alsoInside = aBox("/root/app/b.ts", { depth: 2, y: 100 })
        const outside = aBox("/root/lib.ts", { y: 300 })
        const scene = sceneWith({
            layout: { boxes: [root, folder, inside, alsoInside, outside], bands: [], width: 400, height: 400 },
            edges: [anEdge(inside.path, alsoInside.path), anEdge(inside.path, outside.path)],
            edgeFilter: "none",
            hoveredPath: folder.path
        })

        // Act
        const { edgeIndices, draw } = drawnGraph(scene)

        // Assert
        expect(edgeIndices).toHaveLength(1)
        expect(draw(edgeIndices[0]).children[0].style.opacity).toBe(1)
    })

    it("should dim nothing while the hovered box has no edge crossing its border, as the root never has", () => {
        // Act
        const { edgeIndices, draw } = drawnGraph(sceneWith({ hoveredPath: root.path }))

        // Assert
        expect(edgeIndices.map(index => draw(index).children[0].style.opacity)).toEqual([1, 1])
    })
})
