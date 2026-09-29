import { render, screen } from "@testing-library/angular"
import {
    fireChartEvent,
    lastDrawnOption,
    resetStubbedChart,
    stubbedChart,
    stubElementSize,
    stubResizeObserver
} from "../../testing/dependencyGraph.stub"
import { DependencyGraphScene } from "../../util/dependencyGraphScene"
import { GRAPH_SERIES_ID } from "../../util/dependencyGraphSeries"
import { aBox } from "../../util/dependencyGraphTestData"
import { DependencyGraphComponent } from "./dependencyGraph.component"

jest.mock("echarts/core", () => jest.requireActual("../../testing/dependencyGraph.stub").echartsCoreStub)

const SCENE: DependencyGraphScene = {
    layout: { boxes: [aBox("/root/a.ts")], bands: [], width: 160, height: 40 },
    edges: [],
    edgeFilter: "all",
    edgeStyle: "curved",
    raisedPaths: [],
    hoveredPath: null,
    selectedPath: null
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
        // Act
        await render(DependencyGraphComponent, { inputs: { scene: SCENE } })

        // Assert
        expect(lastDrawnOption().series[0].data[0].name).toBe("/root/a.ts")
    })

    it("should not draw into a container that has no size yet", async () => {
        // Arrange
        measuredSize = { width: 0, height: 0 }

        // Act
        await render(DependencyGraphComponent, { inputs: { scene: SCENE } })

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
            inputs: { scene: SCENE },
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

    it("should zoom back out to the whole graph on request", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE } })

        // Act
        fixture.componentInstance.resetView()

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith(expect.objectContaining({ type: "dataZoom" }))
    })
})
