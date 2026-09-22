import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import { of } from "rxjs"
import { GlobalSettingsFacade } from "../../../features/globalSettings/facade"
import { SunburstNode } from "../../../renderer/sunburst/sunburst.facade"
import {
    fileNode,
    fireChartEvent,
    folderNode,
    lastDrawnOption,
    resetStubbedChart,
    stubbedChart,
    stubElementSize,
    stubResizeObserver,
    TEST_COLORING
} from "../../../renderer/sunburst/testing/sunburstChart.stub"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../stores/fileStore/fileStore.facade"
import { defaultState } from "../../../stores/rootStore/state.manager"
import {
    currentFocusedNodePathSelector,
    hoveredNodeIdSelector,
    selectedBuildingIdSelector
} from "../../../stores/sharedView/sharedView.read.facade"
import {
    setHoveredNodeId,
    setRightClickedNodeData,
    setSelectedBuildingId,
    unfocusNode
} from "../../../stores/sharedView/sharedView.write.facade"
import { MetricsSunburstComponent } from "./metricsSunburst.component"
import { sunburstColoringSelector, sunburstMetricsSelector, sunburstTreeSelector } from "./metricsSunburst.selector"

jest.mock("echarts/core", () => jest.requireActual("../../../renderer/sunburst/testing/sunburstChart.stub").echartsCoreStub)

const TREE = folderNode("/root", [
    folderNode("/root/src", [folderNode("/root/src/app", [fileNode("/root/src/app/deep.ts")]), fileNode("/root/src/b.ts")])
])

interface Setup {
    tree?: SunburstNode | null
    selectedPath?: string | null
    isDeltaState?: boolean
    focusedNodePath?: string
}

async function setup({ tree = TREE, selectedPath = null, isDeltaState = false, focusedNodePath }: Setup = {}) {
    const rendered = await render(MetricsSunburstComponent, {
        providers: [
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: sunburstTreeSelector, value: tree },
                    { selector: sunburstMetricsSelector, value: { areaMetric: "rloc", colorMetric: "mcc" } },
                    { selector: sunburstColoringSelector, value: TEST_COLORING },
                    { selector: hoveredNodeIdSelector, value: null },
                    { selector: selectedBuildingIdSelector, value: selectedPath },
                    { selector: isDeltaStateSelector, value: isDeltaState },
                    { selector: currentFocusedNodePathSelector, value: focusedNodePath }
                ]
            }),
            { provide: State, useValue: { getValue: () => defaultState } },
            { provide: FileStoreReadWindow, useValue: { isLoadingFile$: of(false) } },
            { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(false) } }
        ]
    })
    const store = rendered.fixture.debugElement.injector.get(MockStore)
    jest.spyOn(store, "dispatch")
    return { ...rendered, store }
}

function lastDrawnCentre(): string {
    return lastDrawnOption().series[0].data[0].name
}

describe("MetricsSunburstComponent", () => {
    let restoreElementSize: () => void

    beforeAll(() => {
        restoreElementSize = stubElementSize(() => ({ width: 800, height: 600 }))
    })

    afterAll(() => {
        restoreElementSize()
    })

    beforeEach(() => {
        resetStubbedChart()
        stubResizeObserver()
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

    it("should select a clicked file without moving the centre", async () => {
        // Arrange
        const { store, fixture } = await setup()

        // Act
        fireChartEvent("click", { data: { name: "/root/src/b.ts", isCentre: false, isFile: true } })
        store.overrideSelector(selectedBuildingIdSelector, "/root/src/b.ts")
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedBuildingId({ value: "/root/src/b.ts" }))
        expect(lastDrawnCentre()).toBe("/root")
    })

    it("should centre on the folder of a file selected elsewhere that the rings do not show", async () => {
        // Arrange
        const { store, fixture } = await setup({ selectedPath: "/root/src/app" })
        store.overrideSelector(selectedBuildingIdSelector, null)
        store.refreshState()
        fixture.detectChanges()

        // Act
        store.overrideSelector(selectedBuildingIdSelector, "/root/src/b.ts")
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(lastDrawnCentre()).toBe("/root/src")
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
        fireChartEvent("click", { data: { name: "/root/src", isCentre: false } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedBuildingId({ value: "/root/src" }))
    })

    it("should let go of the hovered folder when drilling, since it moves away from under the pointer", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        fireChartEvent("click", { data: { name: "/root/src", isCentre: false } })

        // Assert
        expect(store.dispatch).toHaveBeenNthCalledWith(1, setHoveredNodeId({ value: null }))
    })

    it("should select the parent folder when the centre is clicked", async () => {
        // Arrange
        const { store } = await setup({ selectedPath: "/root/src/app" })

        // Act
        fireChartEvent("click", { data: { name: "/root/src/app", isCentre: true } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedBuildingId({ value: "/root/src" }))
    })

    it("should go up to the real parent of a merged folder chain", async () => {
        // Arrange
        const mergedChain = folderNode("/root", [folderNode("/root/src/main", [fileNode("/root/src/main/a.ts")])])
        const { store } = await setup({ tree: mergedChain, selectedPath: "/root/src/main" })

        // Act
        fireChartEvent("click", { data: { name: "/root/src/main", isCentre: true } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedBuildingId({ value: "/root" }))
    })

    it("should not go above the top of the map", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        fireChartEvent("click", { data: { name: "/root", isCentre: true } })

        // Assert
        expect(store.dispatch).not.toHaveBeenCalled()
    })

    it("should open the node context menu for a right-clicked node, marked as coming from the sunburst", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        fireChartEvent("contextmenu", { data: { name: "/root/src" }, event: { event: { clientX: 7, clientY: 8 } } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: { nodeId: "/root/src", xPositionOfRightClickEvent: 7, yPositionOfRightClickEvent: 8, origin: "sunburst" }
            })
        )
    })

    it("should share the hovered folder with the rest of the app", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        fireChartEvent("mouseover", { data: { name: "/root/src" } })
        fireChartEvent("mouseout")

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodeId({ value: "/root/src" }))
        await waitFor(() => expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodeId({ value: null })))
    })

    it("should explain instead of drawing while two maps are compared", async () => {
        // Act
        await setup({ isDeltaState: true })

        // Assert
        expect(screen.getByRole("status").textContent).toContain("single map")
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })

    it("should explain instead of drawing when no file has an area", async () => {
        // Act
        await setup({ tree: null })

        // Assert
        expect(screen.getByRole("status").textContent).toContain("no files")
    })

    it("should offer a way out of a focus that leaves nothing to show", async () => {
        // Arrange
        const { store } = await setup({ tree: null, focusedNodePath: "/root/src/b.ts" })

        // Act
        screen.getByRole("button", { name: "Unfocus" }).click()

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(unfocusNode())
    })

    it("should not offer to unfocus when nothing is focused", async () => {
        // Act
        await setup({ tree: null })

        // Assert
        expect(screen.queryByRole("button", { name: "Unfocus" })).toBeNull()
    })

    it("should span the whole width so opening the explorer or inspector does not move it", async () => {
        // Act
        const { fixture } = await setup()

        // Assert
        const host: HTMLElement = fixture.nativeElement
        expect(host.classList).toContain("inset-x-0")
        expect(host.style.left).toBe("")
        expect(host.style.right).toBe("")
    })
})
