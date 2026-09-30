import { render, screen } from "@testing-library/angular"
import { DEPENDENCY_EDGE_TYPES } from "../../../../model/dependencyGraph.model"
import {
    fireChartEvent,
    fireRenderSurfaceEvent,
    lastDrawnOption,
    reportResize,
    resetStubbedChart,
    stubbedChart,
    stubElementSize,
    stubResizeObserver
} from "../../testing/dependencyGraph.stub"
import { AxisWindow, fitWindowOf } from "../../util/dependencyGraphOption.builder"
import { DependencyGraphScene } from "../../util/dependencyGraphScene"
import { GRAPH_SERIES_ID } from "../../util/dependencyGraphSeries"
import { aBox } from "../../util/dependencyGraphTestData"
import { DependencyGraphComponent } from "./dependencyGraph.component"

jest.mock("echarts/core", () => jest.requireActual("../../testing/dependencyGraph.stub").echartsCoreStub)

const SCENE: DependencyGraphScene = {
    layout: { boxes: [aBox("/root/a.ts")], bands: [], width: 160, height: 40 },
    edges: [],
    edgeMetric: "dependencies",
    shownEdgeTypes: DEPENDENCY_EDGE_TYPES,
    edgeStyle: "curved",
    isAnchoredAtSideMiddle: false,
    edgeWidth: { thickness: "byCount", factor: 1 },
    raisedPaths: [],
    draggingPath: null,
    searchedPaths: null,
    hoveredPath: null,
    selectedPath: null
}

const GRAPH_IDENTITY = "project A"

const GROWN_SCENE: DependencyGraphScene = {
    ...SCENE,
    layout: { boxes: [aBox("/root/a.ts", { width: 2000, height: 900 })], bands: [], width: 2000, height: 900 }
}

const PANNED_AND_ZOOMED = (_finder: unknown, [x, y]: number[]) => [x / 2 + 100, y / 2 + 100]
const PANNED_AND_ZOOMED_WINDOW: AxisWindow = { x: [100, 500], y: [100, 400] }

interface ZoomOption {
    startValue: number
    endValue: number
}

function shownWindowOf({ dataZoom: [xZoom, yZoom] }: { dataZoom: ZoomOption[] }): AxisWindow {
    return { x: [xZoom.startValue, xZoom.endValue], y: [yZoom.startValue, yZoom.endValue] }
}

let measuredSize = { width: 800, height: 600 }

describe("DependencyGraphComponent", () => {
    let restoreElementSize: () => void

    beforeAll(() => {
        restoreElementSize = stubElementSize(() => measuredSize)
    })

    afterAll(() => {
        restoreElementSize()
    })

    beforeEach(() => {
        resetStubbedChart()
        stubResizeObserver()
        measuredSize = { width: 800, height: 600 }
    })

    it("should draw the scene once its container has a size", async () => {
        // Arrange
        const inputs = { scene: SCENE, graphIdentity: GRAPH_IDENTITY }

        // Act
        await render(DependencyGraphComponent, { inputs })

        // Assert
        expect(lastDrawnOption().series[0].data[0].name).toBe("/root/a.ts")
    })

    it("should not draw into a container that has no size yet", async () => {
        // Arrange
        measuredSize = { width: 0, height: 0 }

        // Act
        await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })

        // Assert
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })

    it("should pass the chart's clicks, toggles, hovers and right clicks on", async () => {
        // Arrange
        const boxClicked = jest.fn()
        const boxToggled = jest.fn()
        const boxHovered = jest.fn()
        const boxRightClicked = jest.fn()
        const rendered = jest.fn()
        await render(DependencyGraphComponent, {
            inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY },
            on: { boxClicked, boxToggled, boxHovered, boxRightClicked, rendered }
        })
        const box = { seriesId: GRAPH_SERIES_ID, name: "/root/a.ts" }

        // Act
        fireChartEvent("click", box)
        screen.getByTestId("dependency-graph").dispatchEvent(new MouseEvent("dblclick"))
        fireChartEvent("mouseover", box)
        fireChartEvent("contextmenu", { ...box, event: { event: { clientX: 1, clientY: 2 } } })
        fireChartEvent("finished")

        // Assert
        expect(boxClicked).toHaveBeenCalledWith("/root/a.ts")
        expect(boxToggled).toHaveBeenCalledWith("/root/a.ts")
        expect(boxHovered).toHaveBeenCalledWith("/root/a.ts")
        expect(boxRightClicked).toHaveBeenCalledWith({ path: "/root/a.ts", clientX: 1, clientY: 2 })
        expect(rendered).toHaveBeenCalled()
    })

    it("should fit a new graph into view with its first drawing", async () => {
        // Arrange
        const inputs = { scene: SCENE, graphIdentity: GRAPH_IDENTITY }

        // Act
        await render(DependencyGraphComponent, { inputs })

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(fitWindowOf(SCENE.layout, measuredSize))
        expect(stubbedChart.dispatchAction).not.toHaveBeenCalled()
    })

    it("should keep the reader's zoom and position when a redraw grows the graph", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)

        // Act
        fixture.componentRef.setInput("scene", GROWN_SCENE)
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(PANNED_AND_ZOOMED_WINDOW)
    })

    it("should keep the scale and centre of the shown window when the container is resized", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        measuredSize = { width: 400, height: 600 }

        // Act
        reportResize()
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual({ x: [200, 400], y: [100, 400] })
    })

    it("should fit a graph of other files into view although its root keeps the same path", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)

        // Act
        fixture.componentRef.setInput("scene", GROWN_SCENE)
        fixture.componentRef.setInput("graphIdentity", "project B")
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(fitWindowOf(GROWN_SCENE.layout, measuredSize))
    })

    it("should fit the whole graph once for each new fit request", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        fixture.componentRef.setInput("fitRequest", 1)
        fixture.componentRef.setInput("scene", GROWN_SCENE)
        fixture.detectChanges()
        const windowOnRequest = shownWindowOf(lastDrawnOption())

        // Act
        fixture.componentRef.setInput("scene", { ...GROWN_SCENE, hoveredPath: "/root/a.ts" })
        fixture.detectChanges()

        // Assert
        expect(windowOnRequest).toEqual(fitWindowOf(GROWN_SCENE.layout, measuredSize))
        expect(shownWindowOf(lastDrawnOption())).toEqual(PANNED_AND_ZOOMED_WINDOW)
    })

    it("should fit the whole graph when the view is reset", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        const { x, y } = fitWindowOf(SCENE.layout, measuredSize)

        // Act
        fixture.componentInstance.resetView()

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith({
            type: "dataZoom",
            batch: [
                { dataZoomIndex: 0, startValue: x[0], endValue: x[1] },
                { dataZoomIndex: 1, startValue: y[0], endValue: y[1] }
            ]
        })
    })

    it("should report the end of a drag", async () => {
        // Arrange
        const boxDragEnded = jest.fn()
        await render(DependencyGraphComponent, {
            inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY, canDragBox: () => true },
            on: { boxDragEnded }
        })

        // Act
        fireChartEvent("mousedown", { seriesId: GRAPH_SERIES_ID, name: "/root/a.ts", event: { offsetX: 0, offsetY: 0 } })
        fireRenderSurfaceEvent("mouseup")

        // Assert
        expect(boxDragEnded).toHaveBeenCalled()
    })
})
