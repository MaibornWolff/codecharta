import { DEPENDENCY_EDGE_TYPES } from "../../../model/dependencyGraph.model"
import { AxisWindow, buildDependencyGraphOption, fitWindowOf, windowHolding, windowResizedTo } from "./dependencyGraphOption.builder"
import { DependencyGraphScene } from "./dependencyGraphScene"
import { GRAPH_SERIES_ID } from "./dependencyGraphSeries"
import { aBand, aBox, anEdge, DEFAULT_LOOKS, identityPixels } from "./dependencyGraphTestData"

interface DrawnElement {
    emphasisDisabled?: boolean
    children: { info?: string; shape?: Record<string, unknown>; style: Record<string, unknown>; z2?: number }[]
}

interface BuiltSeries {
    id: string
    data: { name?: string; isEdge?: boolean; edgeId?: string; value: number[] }[]
    renderItem: (params: { dataIndex: number }, api: { coord: typeof identityPixels }) => DrawnElement
}

const root = aBox("/root", { kind: "folder", isExpanded: true, depth: 0, levelPath: [], width: 400, height: 200 })
const view = aBox("/root/view.ts", { x: 16, y: 44 })
const model = aBox("/root/model.ts", { x: 16, y: 120 })
const util = aBox("/root/util.ts", { x: 200, y: 120 })
const VIEWPORT = { width: 800, height: 600 }
const SHOWN_WINDOW: AxisWindow = { x: [0, 400], y: [0, 200] }

function sceneWith(overrides: Partial<DependencyGraphScene> = {}): DependencyGraphScene {
    return {
        layout: { boxes: [root, view, model, util], bands: [aBand()], width: 400, height: 200 },
        edges: [anEdge(view.path, model.path), anEdge(util.path, view.path, { type: "feedbackContainerLevel" })],
        edgeMetric: "dependencies",
        shownEdgeTypes: DEPENDENCY_EDGE_TYPES,
        ...DEFAULT_LOOKS,
        edgeStyle: "curved",
        isAnchoredAtSideMiddle: false,
        edgeWidth: { thickness: "byCount", factor: 1 },
        raisedPaths: [],
        draggingPath: null,
        hoveredPath: null,
        selectedPath: null,
        searchedPaths: null,
        ...overrides
    }
}

function drawnGraph(scene: DependencyGraphScene) {
    const option = buildDependencyGraphOption(scene, VIEWPORT, SHOWN_WINDOW)
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
        const { xAxis, yAxis } = buildDependencyGraphOption(sceneWith(), viewport, SHOWN_WINDOW)

        // Assert
        expect((xAxis.max - xAxis.min) / viewport.width).toBeCloseTo((yAxis.max - yAxis.min) / viewport.height)
        expect((xAxis.max + xAxis.min) / 2).toBe(200)
        expect(yAxis.inverse).toBe(true)
    })

    it("should draw everything as one series, the edges over the open folders and under the closed boxes and every name", () => {
        // Arrange
        const scene = sceneWith()

        // Act
        const { option, series } = drawnGraph(scene)

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
        // Arrange
        const scene = sceneWith()

        // Act
        const { series, draw } = drawnGraph(scene)

        // Assert
        const texts = series.data.map((_, index) => draw(index).children.map(child => child.style.text))
        expect(texts[4]).toEqual(["root"])
        expect(texts[0]).toEqual([undefined])
    })

    it("should draw only the edges of the types shown", () => {
        // Arrange
        const scene = sceneWith({ shownEdgeTypes: ["feedbackContainerLevel", "feedbackLeafLevel"] })

        // Act
        const { edgeIndices } = drawnGraph(scene)

        // Assert
        expect(edgeIndices).toHaveLength(1)
    })

    it("should draw every edge of the hovered box, whatever its type", () => {
        // Arrange
        const scene = sceneWith({ shownEdgeTypes: [], hoveredPath: model.path })

        // Act
        const { edgeIndices, describe, draw } = drawnGraph(scene)

        // Assert
        expect(edgeIndices.map(index => describe(index).split("<br/>")[0])).toEqual(["<b>view.ts → model.ts</b>"])
        expect(draw(edgeIndices[0]).children[0].style.opacity).toBe(1)
    })

    it("should mark the selected and the hovered box", () => {
        // Arrange
        const scene = sceneWith({ selectedPath: view.path, hoveredPath: model.path })

        // Act
        const { indexOf, draw } = drawnGraph(scene)

        // Assert
        const strokeWidthOf = (path: string) => draw(indexOf(path)).children[0].style.lineWidth
        expect([view.path, model.path, util.path].map(strokeWidthOf)).toEqual([2.5, 2, 1])
    })

    it("should describe boxes and edges in the tooltip, and nothing for a level band", () => {
        // Arrange
        const scene = sceneWith()

        // Act
        const { describe, edgeIndices, indexOf } = drawnGraph(scene)

        // Assert
        expect(describe(0)).toBe("<b>/root</b><br/><i>Double-click to close</i>")
        expect(describe(1)).toBe("")
        expect(describe(indexOf(view.path))).toBe("<b>/root/view.ts</b><br/>Level 0")
        expect(describe(edgeIndices[1])).toBe("<b>util.ts → view.ts</b><br/>1 dependency · Points upward")
    })

    it("should say in the tooltip that a file holding declarations opens, and what kind of declaration a box is", () => {
        // Arrange
        const file = aBox("/root/creature.ts", { declarationCount: 2, isExpanded: true, width: 300, height: 120 })
        const declaration = aBox("/root/creature.ts/Creature", { kind: "declaration", declarationKind: "class", depth: 2, levelPath: [] })
        const layout = { boxes: [root, file, declaration], bands: [], width: 800, height: 500 }

        // Act
        const { describe, indexOf, option } = drawnGraph(sceneWith({ layout, edges: [] }))

        // Assert
        expect(describe(indexOf(file.path))).toBe("<b>/root/creature.ts</b><br/>Level 0<br/><i>Double-click to close</i>")
        expect(describe(indexOf(declaration.path))).toBe("<b>Creature</b><br/>class")
        expect(option.aria.label.description).toContain("with 1 files")
    })

    it("should draw each edge in the colour the reader gave its type and say how its one dependency is used, in dashes too once the line style shows that", () => {
        // Arrange
        const usedAs = (usage: string[]) => ({
            fromNodeName: view.path,
            fromLeaf: "View",
            toNodeName: model.path,
            toLeaf: "Model",
            attributes: { dependencies: 1 },
            usage
        })
        const edges = [anEdge(view.path, model.path, { declarationEdges: [usedAs(["usage", "inheritance"])] })]
        const edgeColors = { ...DEFAULT_LOOKS.edgeColors, regular: "#123456" }

        // Act
        const byType = drawnGraph(sceneWith({ edges, edgeColors }))
        const byUsage = drawnGraph(sceneWith({ edges, edgeColors, lineStyleShows: "usage" }))

        // Assert
        expect(byType.draw(byType.edgeIndices[0]).children.map(child => child.style.stroke ?? child.style.fill)).toEqual([
            "#123456",
            "#123456"
        ])
        expect(byType.describe(byType.edgeIndices[0])).toBe(
            "<b>View → Model</b><br/>Inherits from, Uses · Dependency<br/>drawn as view.ts → model.ts"
        )
        expect(byUsage.describe(byUsage.edgeIndices[0])).toBe(byType.describe(byType.edgeIndices[0]))
        expect(byUsage.draw(byUsage.edgeIndices[0]).children[1].style.fill).toBe("#ffffff")
    })

    it("should badge a closed box hiding cycles, ring a declaration in a cycle and say both in the tooltip", () => {
        // Arrange
        const declaration = aBox("/root/creature.ts/Creature", { kind: "declaration", declarationKind: "class", levelPath: [] })
        const layout = { boxes: [root, view, declaration], bands: [], width: 800, height: 500 }
        const cycleMarks = { hiddenCycles: new Map([[view.path, 1]]), declarationsInCycles: new Set([declaration.path]) }

        // Act
        const { describe, draw, indexOf } = drawnGraph(sceneWith({ layout, edges: [], cycleMarks }))

        // Assert
        expect(draw(indexOf(view.path)).children.at(-3)).toMatchObject({ info: "cycleBadge", shape: { width: 15 } })
        expect(draw(indexOf(declaration.path)).children.at(-1).style).toMatchObject({ stroke: "#2563eb" })
        expect(describe(indexOf(view.path))).toBe("<b>/root/view.ts</b><br/>Level 0<br/>1 cycle inside")
        expect(describe(indexOf(declaration.path))).toBe("<b>Creature</b><br/>class<br/>Takes part in a cycle")
    })

    it("should draw the selected edge though its type is hidden, with a halo, and tell each edge's id to the chart", () => {
        // Arrange
        const selectedEdgeId = `${view.path}|${model.path}`

        // Act
        const { series, edgeIndices, draw } = drawnGraph(sceneWith({ shownEdgeTypes: [], selectedEdgeId }))

        // Assert
        expect(edgeIndices.map(index => series.data[index].edgeId)).toEqual([selectedEdgeId])
        expect(draw(edgeIndices[0]).children).toHaveLength(3)
    })

    it("should let every other edge step back while edges are pointed at from outside the graph", () => {
        // Arrange
        const highlightedEdgeIds = new Set([`${util.path}|${view.path}`])

        // Act
        const { series, edgeIndices, draw } = drawnGraph(sceneWith({ highlightedEdgeIds, hoveredPath: model.path }))

        // Assert
        const opacityById = Object.fromEntries(edgeIndices.map(index => [series.data[index].edgeId, draw(index).children[0].style.opacity]))
        expect(opacityById).toEqual({ [`${view.path}|${model.path}`]: 0.12, [`${util.path}|${view.path}`]: 1 })
    })

    it("should mark the boxes and edges that differ between the hierarchies and say so in the tooltip, a package by its name", () => {
        // Arrange
        const gamePackage = aBox("package:com.game", { kind: "package", name: "com.game", x: 200, y: 44 })
        const layout = { boxes: [root, view, model, gamePackage], bands: [], width: 400, height: 200 }
        const edges = [anEdge(view.path, model.path)]
        const moved = { movedPaths: new Set([gamePackage.path]), movedEdgeIds: new Set([edges[0].id]) }

        // Act
        const { describe, draw, indexOf, edgeIndices } = drawnGraph(sceneWith({ layout, edges, ...moved }))

        // Assert
        expect(draw(indexOf(gamePackage.path)).children[1].style).toMatchObject({ stroke: "#b45309" })
        expect(draw(indexOf(view.path)).children.map(child => child.style.stroke)).not.toContain("#b45309")
        expect(draw(edgeIndices[0]).children[0].style).toMatchObject({ stroke: "#b45309" })
        expect(describe(indexOf(gamePackage.path))).toBe(
            "<b>Package com.game</b><br/>Level 0<br/><i>Double-click to open</i><br/>Sits elsewhere among the folders and the packages"
        )
        expect(describe(edgeIndices[0])).toContain("Of another type among the folders than among the packages")
    })

    it("should count the declaration edges a bundled edge stands for in its tooltip and invite a click to list them", () => {
        // Arrange
        const usedAs = (toLeaf: string) => ({
            fromNodeName: view.path,
            fromLeaf: "View",
            toNodeName: model.path,
            toLeaf,
            attributes: { dependencies: 1 },
            usage: ["usage"]
        })
        const edges = [anEdge(view.path, model.path, { weight: 2, type: "cyclic", declarationEdges: [usedAs("Model"), usedAs("Node")] })]

        // Act
        const { describe, edgeIndices } = drawnGraph(sceneWith({ edges }))

        // Assert
        expect(describe(edgeIndices[0])).toBe(
            "<b>view.ts → model.ts</b><br/>2 declaration edges · In a cycle<br/><i>Click to list them</i>"
        )
    })

    it("should name an unfolded edge by its declarations alone", () => {
        // Arrange
        const declarationEdge = {
            fromNodeName: view.path,
            fromLeaf: "view.ts",
            toNodeName: model.path,
            toLeaf: "model.ts",
            attributes: {},
            usage: []
        }
        const edges = [anEdge(view.path, model.path, { declarationEdges: [declarationEdge] })]

        // Act
        const { describe, edgeIndices } = drawnGraph(sceneWith({ edges }))

        // Assert
        expect(describe(edgeIndices[0])).toBe("<b>view.ts → model.ts</b><br/>Dependency")
    })

    it("should draw the upward edge that closes a cycle in the colour of the upward edges while dashes tell the types apart, and in its own once they tell the kind of use", () => {
        // Arrange
        const edges = [anEdge(view.path, model.path, { type: "feedbackLeafLevel" })]
        const strokeOf = (scene: DependencyGraphScene) => {
            const { draw, edgeIndices } = drawnGraph(scene)
            return draw(edgeIndices[0]).children[0].style.stroke
        }

        // Act
        const byEdgeType = strokeOf(sceneWith({ edges }))
        const byUsage = strokeOf(sceneWith({ edges, lineStyleShows: "usage" }))

        // Assert
        expect(byEdgeType).toBe("#dc2626")
        expect(byUsage).toBe("#7f1d1d")
    })

    it("should name the metric and its value in the tooltip of another metric's edge", () => {
        // Arrange
        const edges = [anEdge(view.path, model.path, { weight: 0.375 })]

        // Act
        const { describe, edgeIndices } = drawnGraph(sceneWith({ edges, edgeMetric: "temporal_coupling" }))

        // Assert
        expect(describe(edgeIndices[0])).toBe("<b>view.ts → model.ts</b><br/>temporal_coupling 0.375")
    })

    it("should widen the edges relative to the lightest one shown, so a metric below one still spreads its widths", () => {
        // Arrange
        const edges = [anEdge(view.path, model.path, { weight: 0.25 }), anEdge(util.path, model.path, { weight: 1 })]

        // Act
        const { edgeIndices, draw } = drawnGraph(sceneWith({ edges, edgeMetric: "temporal_coupling" }))

        // Assert
        expect(edgeIndices.map(index => draw(index).children[0].style.lineWidth)).toEqual([1.2, 2.2])
    })

    it("should draw the level bands", () => {
        // Arrange
        const scene = sceneWith()

        // Act
        const { draw } = drawnGraph(scene)

        // Assert
        expect(draw(1).children[0].style.text).toBe("level 1")
    })

    it("should keep ECharts from lifting a hovered item over the rest, so an open folder never covers its children", () => {
        // Arrange
        const scene = sceneWith({ hoveredPath: view.path })

        // Act
        const { series, draw } = drawnGraph(scene)

        // Assert
        expect(series.data.map((_, index) => draw(index).emphasisDisabled)).toEqual(series.data.map(() => true))
    })

    it("should pin every element to its place in the paint order, which ECharts would otherwise lose for elements added in a later draw", () => {
        // Arrange
        const scene = sceneWith()

        // Act
        const { series, draw } = drawnGraph(scene)

        // Assert
        const ranks = series.data.map((_, index) => draw(index).children.map(child => child.z2))
        expect(ranks).toEqual(series.data.map((_, index) => ranks[index].map(() => index)))
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

    it("should draw the edges as wide as the scene asks", () => {
        // Arrange
        const scene = sceneWith({ edgeWidth: { thickness: "uniform", factor: 2 } })

        // Act
        const { edgeIndices, draw } = drawnGraph(scene)

        // Assert
        expect(edgeIndices.map(index => draw(index).children[0].style.lineWidth)).toEqual([3.2, 3.2])
    })

    it("should light up only the edges crossing a hovered folder's border", () => {
        // Arrange
        const folder = aBox("/root/app", { kind: "folder", isExpanded: true, width: 400, height: 200 })
        const inside = aBox("/root/app/a.ts", { depth: 2 })
        const alsoInside = aBox("/root/app/b.ts", { depth: 2, y: 100 })
        const outside = aBox("/root/lib.ts", { y: 300 })
        const scene = sceneWith({
            layout: { boxes: [root, folder, inside, alsoInside, outside], bands: [], width: 400, height: 400 },
            edges: [anEdge(inside.path, alsoInside.path), anEdge(inside.path, outside.path)],
            shownEdgeTypes: [],
            hoveredPath: folder.path
        })

        // Act
        const { edgeIndices, draw } = drawnGraph(scene)

        // Assert
        expect(edgeIndices).toHaveLength(1)
        expect(draw(edgeIndices[0]).children[0].style.opacity).toBe(1)
    })

    it("should dim nothing while the hovered box has no edge crossing its border, as the root never has", () => {
        // Arrange
        const scene = sceneWith({ hoveredPath: root.path })

        // Act
        const { edgeIndices, draw } = drawnGraph(scene)

        // Assert
        expect(edgeIndices.map(index => draw(index).children[0].style.opacity)).toEqual([1, 1])
    })

    it("should let a moved folder show what it overlaps, and a dragged folder always", () => {
        // Arrange
        const lib = aBox("/root/lib", { kind: "folder", isExpanded: true, depth: 1, x: 20, y: 20, width: 200, height: 100 })
        const ui = aBox("/root/ui", { kind: "folder", isExpanded: true, depth: 1, x: 100, y: 60, width: 200, height: 100 })
        const apart = aBox("/root/apart", { kind: "folder", isExpanded: true, depth: 1, x: 20, y: 300, width: 100, height: 50 })
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
        // Arrange
        const squareViewport = { width: 800, height: 800 }

        // Act
        const { xAxis, yAxis } = buildDependencyGraphOption(sceneWith(), squareViewport, SHOWN_WINDOW)

        // Assert
        expect([xAxis.min, xAxis.max]).toEqual([-400, 800])
        expect(yAxis.min).toBeLessThan(-400)
    })

    it("should show the given window on both axes in layout values", () => {
        // Arrange
        const shownWindow: AxisWindow = { x: [-20, 380], y: [10, 310] }

        // Act
        const { dataZoom } = buildDependencyGraphOption(sceneWith(), VIEWPORT, shownWindow)

        // Assert
        expect(dataZoom).toEqual([
            expect.objectContaining({ type: "inside", xAxisIndex: 0, startValue: -20, endValue: 380 }),
            expect.objectContaining({ type: "inside", yAxisIndex: 0, startValue: 10, endValue: 310 })
        ])
        expect(dataZoom.some(zoom => "start" in zoom || "end" in zoom)).toBe(false)
    })

    it("should stretch the axes to reach a shown window beyond the room around the graph", () => {
        // Arrange
        const windowBeyondTheRoom: AxisWindow = { x: [-5000, 100], y: [0, 9000] }

        // Act
        const { xAxis, yAxis } = buildDependencyGraphOption(sceneWith(), VIEWPORT, windowBeyondTheRoom)

        // Assert
        expect(xAxis.min).toBe(-5000)
        expect(yAxis.max).toBe(9000)
        expect(xAxis.max).toBeGreaterThan(400)
    })

    it("should draw a scene without edges", () => {
        // Arrange
        const scene = sceneWith({ edges: [] })

        // Act
        const { series, edgeIndices, draw } = drawnGraph(scene)

        // Assert
        expect(edgeIndices).toEqual([])
        expect(series.data.map(datum => datum.name).filter(Boolean)).toEqual([root.path, view.path, model.path, util.path])
        expect(draw(0).children).toHaveLength(1)
    })

    it("should keep the axes numbers while the chart has no size yet", () => {
        // Arrange
        const noSize = { width: 0, height: 0 }

        // Act
        const { xAxis, yAxis } = buildDependencyGraphOption(sceneWith(), noSize, SHOWN_WINDOW)

        // Assert
        expect([xAxis.min, xAxis.max, yAxis.min, yAxis.max].every(Number.isFinite)).toBe(true)
    })
})

describe("windowHolding", () => {
    const layout = { boxes: [root, view, model, util], bands: [], width: 400, height: 200 }
    const viewport = { width: 800, height: 400 }

    it("should keep the window shown when it holds the boxes asked for already", () => {
        // Arrange
        const shownWindow: AxisWindow = { x: [0, 400], y: [0, 200] }

        // Act
        const window = windowHolding([view.path, model.path], layout, viewport, shownWindow)

        // Assert
        expect(window).toBe(shownWindow)
    })

    it("should centre on the boxes asked for when one of them lies outside the window shown, no larger than one and a half times their size", () => {
        // Arrange
        const lookingElsewhere: AxisWindow = { x: [1000, 1400], y: [1000, 1200] }

        // Act
        const window = windowHolding([view.path], layout, viewport, lookingElsewhere)

        // Assert
        const centre = [(window.x[0] + window.x[1]) / 2, (window.y[0] + window.y[1]) / 2]
        expect(centre).toEqual([view.x + view.width / 2, view.y + view.height / 2])
        expect(800 / (window.x[1] - window.x[0])).toBeCloseTo(1.5)
    })

    it("should zoom out as far as it takes to hold boxes lying far apart, with room around them", () => {
        // Arrange
        const far = aBox("/root/far.ts", { x: 3000, y: 44 })
        const wide = { ...layout, boxes: [...layout.boxes, far] }

        // Act
        const window = windowHolding([view.path, far.path], wide, viewport, null)

        // Assert
        expect(window.x[0]).toBeLessThan(view.x)
        expect(window.x[1]).toBeGreaterThan(far.x + far.width)
        expect((far.x + far.width - view.x) / (window.x[1] - window.x[0])).toBeCloseTo(0.8)
    })

    it("should have no window for boxes that are not on screen", () => {
        // Act
        const window = windowHolding(["/root/hidden.ts"], layout, viewport, null)

        // Assert
        expect(window).toBeNull()
    })
})

describe("fitWindowOf", () => {
    it("should fit the root as drawn, grown by dragged boxes, with equal scale on both axes", () => {
        // Arrange
        const grownRoot = aBox("/root", { kind: "folder", isExpanded: true, depth: 0, x: -100, y: -50, width: 500, height: 250 })
        const layout = { boxes: [grownRoot], bands: [], width: 400, height: 200 }

        // Act
        const window = fitWindowOf(layout, { width: 1000, height: 500 })

        // Assert
        expect((window.x[0] + window.x[1]) / 2).toBe(150)
        expect((window.y[0] + window.y[1]) / 2).toBe(75)
        expect((window.x[1] - window.x[0]) / 1000).toBeCloseTo((window.y[1] - window.y[0]) / 500)
        expect(window.x[1] - window.x[0]).toBeGreaterThan(500)
    })

    it("should fit the root without a scale while the chart has no size yet", () => {
        // Arrange
        const layout = { boxes: [root], bands: [], width: 400, height: 200 }

        // Act
        const window = fitWindowOf(layout, { width: 0, height: 0 })

        // Assert
        expect(window).toEqual({ x: [0, 400], y: [0, 200] })
    })

    it("should fit an empty graph without a size to finite numbers", () => {
        // Arrange
        const emptyLayout = { boxes: [], bands: [], width: 0, height: 0 }

        // Act
        const window = fitWindowOf(emptyLayout, { width: 0, height: 0 })

        // Assert
        expect([...window.x, ...window.y].every(Number.isFinite)).toBe(true)
    })
})

describe("windowResizedTo", () => {
    it("should keep the window's centre and its pixels per unit on both axes when the chart is resized", () => {
        // Arrange
        const windowFittedAtWideSize: AxisWindow = { x: [0, 1276], y: [0, 638] }

        // Act
        const window = windowResizedTo(windowFittedAtWideSize, { width: 1600, height: 800 }, { width: 800, height: 800 })

        // Assert
        expect(window).toEqual({ x: [319, 957], y: [0, 638] })
        expect(800 / (window.x[1] - window.x[0])).toBeCloseTo(1600 / 1276)
        expect(800 / (window.y[1] - window.y[0])).toBeCloseTo(1600 / 1276)
    })
})
