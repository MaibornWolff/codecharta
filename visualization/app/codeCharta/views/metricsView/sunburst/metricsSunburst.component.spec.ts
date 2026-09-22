import { signal } from "@angular/core"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { GlobalSettingsFacade } from "../../../features/globalSettings/facade"
import { ExplorerCollapseService, ExplorerWidthService } from "../../../features/sidebarExplorer/facade"
import { InspectorVisibilityService } from "../../../features/sidebarInspector/facade"
import { ColorMode } from "../../../model/codeCharta.model"
import { SunburstNode } from "../../../renderer/sunburst/sunburst.facade"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { defaultMapColors } from "../../../stores/mapState/mapState.read.facade"
import { defaultState } from "../../../stores/rootStore/state.manager"
import { hoveredNodeIdSelector, selectedBuildingIdSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodeId, setSelectedBuildingId } from "../../../stores/sharedView/sharedView.write.facade"
import { MetricsSunburstComponent } from "./metricsSunburst.component"
import { sunburstColoringSelector, sunburstMetricsSelector, sunburstTreeSelector } from "./metricsSunburst.selector"

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

function folder(path: string, children: SunburstNode[] = []): SunburstNode {
    return { path, name: path.split("/").at(-1), area: 10, colorValue: 5, isFlat: false, children }
}

const FOLDERS = folder("/root", [folder("/root/src", [folder("/root/src/app")])])

interface Setup {
    tree?: SunburstNode | null
    selectedPath?: string | null
    isDeltaState?: boolean
    isExplorerCollapsed?: boolean
    isInspectorVisible?: boolean
}

async function setup({
    tree = FOLDERS,
    selectedPath = null,
    isDeltaState = false,
    isExplorerCollapsed = false,
    isInspectorVisible = false
}: Setup = {}) {
    const rendered = await render(MetricsSunburstComponent, {
        providers: [
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: sunburstTreeSelector, value: tree },
                    { selector: sunburstMetricsSelector, value: { areaMetric: "rloc", colorMetric: "mcc" } },
                    {
                        selector: sunburstColoringSelector,
                        value: {
                            colorMetric: "mcc",
                            colorRange: { from: 10, to: 20 },
                            colorMode: ColorMode.absolute,
                            mapColors: defaultMapColors,
                            colorMetricRange: { minValue: 0, maxValue: 100 }
                        }
                    },
                    { selector: hoveredNodeIdSelector, value: null },
                    { selector: selectedBuildingIdSelector, value: selectedPath },
                    { selector: isDeltaStateSelector, value: isDeltaState }
                ]
            }),
            { provide: State, useValue: { getValue: () => defaultState } },
            { provide: FileStoreReadWindow, useValue: { isLoadingFile$: of(false) } },
            { provide: ExplorerCollapseService, useValue: { isCollapsed: signal(isExplorerCollapsed) } },
            { provide: ExplorerWidthService, useValue: { width: signal(300) } },
            { provide: InspectorVisibilityService, useValue: { isVisible: signal(isInspectorVisible) } },
            { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } }
        ]
    })
    const store = rendered.fixture.debugElement.injector.get(MockStore)
    jest.spyOn(store, "dispatch")
    return { ...rendered, store }
}

function lastDrawnCentre() {
    const [option] = mockChart.setOption.mock.calls.at(-1)
    return option.series[0].data[0].name
}

describe("MetricsSunburstComponent", () => {
    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 })
        Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 600 })
    })

    afterAll(() => {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
    })

    beforeEach(() => {
        jest.clearAllMocks()
        chartEventHandlers.clear()
        globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
    })

    it("should centre on the top of the map while nothing is selected", async () => {
        // Act
        await setup()

        // Assert
        expect(lastDrawnCentre()).toBe("/root")
        expect(screen.getByRole("button", { name: /screenshot/i })).not.toBeNull()
    })

    it("should centre on the selected folder, and on the folder of a selected file", async () => {
        // Arrange
        const { store, fixture } = await setup({ selectedPath: "/root/src" })
        const centredOnFolder = lastDrawnCentre()

        // Act
        store.overrideSelector(selectedBuildingIdSelector, "/root/src/app/file.ts")
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(centredOnFolder).toBe("/root/src")
        expect(lastDrawnCentre()).toBe("/root/src/app")
    })

    it("should keep its centre when the selection is cleared", async () => {
        // Arrange
        const { store, fixture } = await setup({ selectedPath: "/root/src" })

        // Act
        store.overrideSelector(selectedBuildingIdSelector, null)
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(lastDrawnCentre()).toBe("/root/src")
    })

    it("should select a clicked folder", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root/src", isCentre: false } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedBuildingId({ value: "/root/src" }))
    })

    it("should let go of the hovered folder when drilling, since it moves away from under the pointer", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root/src", isCentre: false } })

        // Assert
        expect(store.dispatch).toHaveBeenNthCalledWith(1, setHoveredNodeId({ value: null }))
    })

    it("should select the parent folder when the centre is clicked", async () => {
        // Arrange
        const { store } = await setup({ selectedPath: "/root/src/app" })

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root/src/app", isCentre: true } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedBuildingId({ value: "/root/src" }))
    })

    it("should not go above the top of the map", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        chartEventHandlers.get("click")({ data: { name: "/root", isCentre: true } })

        // Assert
        expect(store.dispatch).not.toHaveBeenCalled()
    })

    it("should share the hovered folder with the rest of the app", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        chartEventHandlers.get("mouseover")({ data: { name: "/root/src" } })
        chartEventHandlers.get("mouseout")({})

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodeId({ value: "/root/src" }))
        expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodeId({ value: null }))
    })

    it("should explain instead of drawing while two maps are compared", async () => {
        // Act
        await setup({ isDeltaState: true })

        // Assert
        expect(screen.getByRole("status").textContent).toContain("single map")
        expect(mockChart.setOption).not.toHaveBeenCalled()
    })

    it("should explain instead of drawing when no folder has an area", async () => {
        // Act
        await setup({ tree: null })

        // Assert
        expect(screen.getByRole("status").textContent).toContain("no folders")
    })

    it("should keep clear of the open explorer and inspector", async () => {
        // Act
        const { fixture } = await setup({ isInspectorVisible: true })

        // Assert
        const host: HTMLElement = fixture.nativeElement
        expect(host.style.left).toBe("300px")
        expect(host.style.right).toBe("var(--cc-inspector-width)")
    })

    it("should use the full width while the sidebars are closed", async () => {
        // Act
        const { fixture } = await setup({ isExplorerCollapsed: true })

        // Assert
        const host: HTMLElement = fixture.nativeElement
        expect(host.style.left).toBe("0px")
        expect(host.style.right).toBe("0px")
    })
})
