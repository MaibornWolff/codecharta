import { render } from "@testing-library/angular"
import { ColorMode } from "../../../../model/codeCharta.model"
import { defaultMapColors } from "../../../../stores/mapState/store/mapColors/mapColors.reducer"
import { SunburstColoring } from "../../util/sunburstColor"
import { SunburstNode } from "../../util/sunburstTree"
import { SunburstComponent } from "./sunburst.component"

type EventHandler = (event: unknown) => void

const chartEventHandlers = new Map<string, EventHandler>()

const mockChart = {
    setOption: jest.fn(),
    dispatchAction: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
    on: jest.fn((eventName: string, handler: EventHandler) => chartEventHandlers.set(eventName, handler))
}

jest.mock("echarts/core", () => ({
    init: jest.fn(() => mockChart),
    use: jest.fn()
}))

class ResizeObserverMock {
    observe() {}
    disconnect() {}
}

const COLORING: SunburstColoring = {
    colorMetric: "mcc",
    colorRange: { from: 10, to: 20 },
    colorMode: ColorMode.absolute,
    mapColors: defaultMapColors,
    colorMetricRange: { minValue: 0, maxValue: 100 }
}

function folder(path: string, children: SunburstNode[] = []): SunburstNode {
    return { path, name: path.split("/").at(-1), area: 10, colorValue: 5, isFlat: false, children }
}

const FOLDERS = folder("/root", [
    folder("/root/src", [folder("/root/src/app", [folder("/root/src/app/a", [folder("/root/src/app/a/b")])])])
])

let measuredSize = { width: 800, height: 600 }

async function renderSunburst(inputs: Partial<{ centrePath: string; hoveredPath: string | null }> = {}) {
    return render(SunburstComponent, {
        inputs: {
            tree: FOLDERS,
            centrePath: "/root",
            hoveredPath: null,
            metrics: { areaMetric: "rloc", colorMetric: "mcc" },
            coloring: COLORING,
            ...inputs
        }
    })
}

function lastDrawnCentre() {
    const [option] = mockChart.setOption.mock.calls.at(-1)
    return option.series[0].data[0]
}

function lastHighlight() {
    return mockChart.dispatchAction.mock.calls
        .map(([action]) => action)
        .filter(action => action.type === "highlight")
        .at(-1)
}

describe("SunburstComponent", () => {
    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => measuredSize.width })
        Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => measuredSize.height })
    })

    afterAll(() => {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
    })

    beforeEach(() => {
        jest.clearAllMocks()
        chartEventHandlers.clear()
        measuredSize = { width: 800, height: 600 }
        globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
    })

    it("should draw the folder it is centred on", async () => {
        // Act
        await renderSunburst({ centrePath: "/root/src" })

        // Assert
        expect(lastDrawnCentre().name).toBe("/root/src")
    })

    it("should fall back to the top of the map when the centre is no longer in it", async () => {
        // Act
        await renderSunburst({ centrePath: "/root/gone" })

        // Assert
        expect(lastDrawnCentre().name).toBe("/root")
    })

    it("should not draw into a container that has no size yet", async () => {
        // Arrange
        measuredSize = { width: 0, height: 0 }

        // Act
        await renderSunburst()

        // Assert
        expect(mockChart.setOption).not.toHaveBeenCalled()
    })

    it("should highlight the drawn folder that holds the hovered path", async () => {
        // Act
        await renderSunburst({ hoveredPath: "/root/src/app/a/b/deep.ts" })

        // Assert
        expect(lastHighlight()).toEqual({ type: "highlight", seriesIndex: 0, name: "/root/src/app/a" })
    })

    it("should highlight nothing for a hovered path outside the drawn folders", async () => {
        // Act
        await renderSunburst({ centrePath: "/root/src/app", hoveredPath: "/root/other.ts" })

        // Assert
        expect(lastHighlight()).toBeUndefined()
    })

    it("should not highlight the centre, which would dim every ring around it", async () => {
        // Act
        await renderSunburst({ centrePath: "/root/src", hoveredPath: "/root/src/file.ts" })

        // Assert
        expect(lastHighlight()).toBeUndefined()
    })

    it("should pass clicks and hovers on to its outputs", async () => {
        // Arrange
        const { fixture } = await renderSunburst({ centrePath: "/root/src" })
        const folderClicked = jest.fn()
        const centreClicked = jest.fn()
        const folderHovered = jest.fn()
        fixture.componentInstance.folderClicked.subscribe(folderClicked)
        fixture.componentInstance.centreClicked.subscribe(centreClicked)
        fixture.componentInstance.folderHovered.subscribe(folderHovered)

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root/src/app", isCentre: false } })
        chartEventHandlers.get("click")({ data: { name: "/root/src", isCentre: true } })
        chartEventHandlers.get("mouseover")({ data: { name: "/root/src/app" } })

        // Assert
        expect(folderClicked).toHaveBeenCalledWith("/root/src/app")
        expect(centreClicked).toHaveBeenCalled()
        expect(folderHovered).toHaveBeenCalledWith("/root/src/app")
    })

    it("should dispose the chart when destroyed", async () => {
        // Arrange
        const { fixture } = await renderSunburst()

        // Act
        fixture.destroy()

        // Assert
        expect(mockChart.dispose).toHaveBeenCalled()
    })
})
