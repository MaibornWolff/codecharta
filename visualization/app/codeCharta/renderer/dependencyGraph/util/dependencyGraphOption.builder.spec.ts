import { buildDependencyGraphOption, fitWindowOf } from "./dependencyGraphOption.builder"
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
        draggingPath: null,
        hoveredPath: null,
        selectedPath: null,
        searchedPaths: null,
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

    it("should draw everything as one series, the edges over the open folders and under the closed boxes and every name", () => {
        // Act
        const { option, series } = drawnGraph(sceneWith())

        // Assert
        expect(option.series.map(built => built.id)).toEqual([GRAPH_SERIES_ID])
        expect(series.data.map(datum => datum.name ?? (datum.isEdge ? "edge" : "decoration"))).toEqual([
            "/root",
            "decoration",
            "edge",
            "edge",
            "decoration",
            "/root/view.ts",
            "/root/model.ts",
            "/root/util.ts"
        ])
    })

    it("should name an open folder over the edges", () => {
        // Act
        const { series, draw } = drawnGraph(sceneWith())

        // Assert
        const texts = series.data.map((_, index) => draw(index).children.map(child => child.style.text))
        expect(texts[4]).toEqual(["root"])
        expect(texts[0]).toEqual([undefined])
    })

    it("should draw only the edges the filter lets through", () => {
        // Act
        const { edgeIndices } = drawnGraph(sceneWith({ edgeFilter: "feedback" }))

        // Assert
        expect(edgeIndices).toHaveLength(1)
    })

    it("should draw every edge of the hovered box, whatever the filter", () => {
        // Act
        const { edgeIndices, describe, draw } = drawnGraph(sceneWith({ edgeFilter: "none", hoveredPath: model.path }))

        // Assert
        expect(edgeIndices.map(index => describe(index).split("<br/>")[0])).toEqual(["<b>view.ts → model.ts</b>"])
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
        const { describe, edgeIndices, indexOf } = drawnGraph(sceneWith())

        // Assert
        expect(describe(0)).toBe("<b>/root</b><br/>Level 0<br/><i>Double-click to close</i>")
        expect(describe(1)).toBe("")
        expect(describe(indexOf(view.path))).toBe("<b>/root/view.ts</b><br/>Level 0")
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

    it("should let a moved folder show what it overlaps, and a dragged folder always", () => {
        // Arrange
        const lib = aBox("/root/lib", { isFolder: true, isExpanded: true, depth: 1, x: 20, y: 20, width: 200, height: 100 })
        const ui = aBox("/root/ui", { isFolder: true, isExpanded: true, depth: 1, x: 100, y: 60, width: 200, height: 100 })
        const apart = aBox("/root/apart", { isFolder: true, isExpanded: true, depth: 1, x: 20, y: 300, width: 100, height: 50 })
        const layout = { boxes: [root, lib, ui, apart], bands: [], width: 400, height: 400 }

        // Act
        const { indexOf, draw } = drawnGraph(sceneWith({ layout, edges: [], raisedPaths: [ui.path], draggingPath: apart.path }))

        // Assert
        const fillOf = (path: string) => draw(indexOf(path)).children[0].style.fill
        expect(fillOf(lib.path)).toMatch(/^#/)
        expect(fillOf(ui.path)).toMatch(/^rgba/)
        expect(fillOf(apart.path)).toMatch(/^rgba/)
    })

    it("should fade the boxes a search missed, and the edges running only between them", () => {
        // Arrange
        const edges = [anEdge(view.path, model.path), anEdge(util.path, model.path)]

        // Act
        const { indexOf, draw, edgeIndices } = drawnGraph(sceneWith({ edges, searchedPaths: new Set([view.path]) }))

        // Assert
        const opacityOf = (index: number) => draw(index).children[0].style.opacity
        expect([root.path, view.path, model.path, util.path].map(path => opacityOf(indexOf(path)))).toEqual([1, 1, 0.3, 0.3])
        expect(edgeIndices.map(opacityOf)).toEqual([1, 0.12])
    })

    it("should give the axes room around the graph for dragged boxes to grow into", () => {
        // Act
        const { xAxis, yAxis } = buildDependencyGraphOption(sceneWith(), { width: 800, height: 800 })

        // Assert
        expect([xAxis.min, xAxis.max]).toEqual([-400, 800])
        expect(yAxis.min).toBeLessThan(-400)
    })
})

describe("fitWindowOf", () => {
    it("should fit the root as drawn, grown by dragged boxes, with equal scale on both axes", () => {
        // Arrange
        const grownRoot = aBox("/root", { isFolder: true, isExpanded: true, depth: 0, x: -100, y: -50, width: 500, height: 250 })
        const layout = { boxes: [grownRoot], bands: [], width: 400, height: 200 }

        // Act
        const window = fitWindowOf(layout, { width: 1000, height: 500 })

        // Assert
        expect((window.x[0] + window.x[1]) / 2).toBe(150)
        expect((window.y[0] + window.y[1]) / 2).toBe(75)
        expect((window.x[1] - window.x[0]) / 1000).toBeCloseTo((window.y[1] - window.y[0]) / 500)
        expect(window.x[1] - window.x[0]).toBeGreaterThan(500)
    })
})
