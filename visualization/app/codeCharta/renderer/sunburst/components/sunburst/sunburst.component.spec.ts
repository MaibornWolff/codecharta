import { render } from "@testing-library/angular"
import {
    fireChartEvent,
    folderNode,
    lastDrawnOption,
    lastHighlightedPath,
    resetStubbedChart,
    stubbedChart,
    stubElementSize,
    stubResizeObserver,
    TEST_COLORING
} from "../../testing/sunburstChart.stub"
import { SunburstNode } from "../../util/sunburstTree"
import { SunburstComponent } from "./sunburst.component"

jest.mock("echarts/core", () => jest.requireActual("../../testing/sunburstChart.stub").echartsCoreStub)

const DEEPEST = folderNode("/root/src/app/a/b")
const APP = folderNode("/root/src/app", [folderNode("/root/src/app/a", [DEEPEST])])
const SRC = folderNode("/root/src", [APP])
const ROOT = folderNode("/root", [SRC])

let measuredSize = { width: 800, height: 600 }

async function renderSunburst(inputs: Partial<{ centre: SunburstNode; hoveredPath: string | null }> = {}) {
    return render(SunburstComponent, {
        inputs: {
            tree: ROOT,
            centre: ROOT,
            hoveredPath: null,
            metrics: { areaMetric: "rloc", colorMetric: "mcc" },
            coloring: TEST_COLORING,
            ...inputs
        }
    })
}

describe("SunburstComponent", () => {
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

    it("should draw the folder it is centred on", async () => {
        // Act
        await renderSunburst({ centre: SRC })

        // Assert
        expect(lastDrawnOption().series[0].data[0].name).toBe("/root/src")
    })

    it("should not draw into a container that has no size yet", async () => {
        // Arrange
        measuredSize = { width: 0, height: 0 }

        // Act
        await renderSunburst()

        // Assert
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })

    it("should highlight the drawn folder that holds the hovered path", async () => {
        // Act
        await renderSunburst({ hoveredPath: "/root/src/app/a/b/deep.ts" })

        // Assert
        expect(lastHighlightedPath()).toBe("/root/src/app/a")
    })

    it("should highlight nothing for a hovered path outside the drawn folders", async () => {
        // Act
        await renderSunburst({ centre: APP, hoveredPath: "/root/other.ts" })

        // Assert
        expect(lastHighlightedPath()).toBeUndefined()
    })

    it("should not highlight the centre, which would dim every ring around it", async () => {
        // Act
        await renderSunburst({ centre: SRC, hoveredPath: "/root/src/file.ts" })

        // Assert
        expect(lastHighlightedPath()).toBeUndefined()
    })

    it("should pass clicks and hovers on to its outputs", async () => {
        // Arrange
        const { fixture } = await renderSunburst({ centre: SRC })
        const folderClicked = jest.fn()
        const centreClicked = jest.fn()
        const nodeHovered = jest.fn()
        fixture.componentInstance.folderClicked.subscribe(folderClicked)
        fixture.componentInstance.centreClicked.subscribe(centreClicked)
        fixture.componentInstance.nodeHovered.subscribe(nodeHovered)

        // Act
        fireChartEvent("click", { data: { name: "/root/src/app", isCentre: false } })
        fireChartEvent("click", { data: { name: "/root/src", isCentre: true } })
        fireChartEvent("mouseover", { data: { name: "/root/src/app" } })

        // Assert
        expect(folderClicked).toHaveBeenCalledWith("/root/src/app")
        expect(centreClicked).toHaveBeenCalled()
        expect(nodeHovered).toHaveBeenCalledWith("/root/src/app")
    })

    it("should report a click on a file separately from a click on a folder", async () => {
        // Arrange
        const { fixture } = await renderSunburst()
        const fileClicked = jest.fn()
        fixture.componentInstance.fileClicked.subscribe(fileClicked)

        // Act
        fireChartEvent("click", { data: { name: "/root/a.ts", isCentre: false, isFile: true } })

        // Assert
        expect(fileClicked).toHaveBeenCalledWith("/root/a.ts")
    })

    it("should report a right-clicked node with where it happened", async () => {
        // Arrange
        const { fixture } = await renderSunburst()
        const nodeRightClicked = jest.fn()
        fixture.componentInstance.nodeRightClicked.subscribe(nodeRightClicked)

        // Act
        fireChartEvent("contextmenu", { data: { name: "/root/src" }, event: { event: { clientX: 5, clientY: 6 } } })

        // Assert
        expect(nodeRightClicked).toHaveBeenCalledWith({ path: "/root/src", clientX: 5, clientY: 6 })
    })

    it("should dispose the chart when destroyed", async () => {
        // Arrange
        const { fixture } = await renderSunburst()

        // Act
        fixture.destroy()

        // Assert
        expect(stubbedChart.dispose).toHaveBeenCalled()
    })
})
