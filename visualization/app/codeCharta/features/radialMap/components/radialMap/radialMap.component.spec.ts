import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { RadialNode } from "../../../../renderer/radialMap/radialMap.facade"
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
} from "../../../../renderer/radialMap/testing/radialChart.stub"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { layoutAlgorithmSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import {
    currentFocusedNodePathSelector,
    hoveredNodePathSelector,
    selectedNodePathSelector
} from "../../../../stores/sharedView/sharedView.read.facade"
import {
    setHoveredNodePath,
    setRightClickedNodeData,
    setSelectedNodePath,
    unfocusNode
} from "../../../../stores/sharedView/sharedView.write.facade"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { radialColoringSelector, radialMetricsSelector, radialTreeSelector } from "../../selectors/radialMap.selectors"
import { RadialMapComponent } from "./radialMap.component"

jest.mock("echarts/core", () => jest.requireActual("../../../../renderer/radialMap/testing/radialChart.stub").echartsCoreStub)

const TREE = folderNode("/root", [
    folderNode("/root/src", [folderNode("/root/src/app", [fileNode("/root/src/app/deep.ts")]), fileNode("/root/src/b.ts")])
])

interface Setup {
    tree?: RadialNode | null
    selectedPath?: string | null
    isDeltaState?: boolean
    focusedNodePath?: string
    layoutAlgorithm?: LayoutAlgorithm
}

async function setup({
    tree = TREE,
    selectedPath = null,
    isDeltaState = false,
    focusedNodePath,
    layoutAlgorithm = LayoutAlgorithm.Sunburst
}: Setup = {}) {
    const rendered = await render(RadialMapComponent, {
        providers: [
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: radialTreeSelector, value: tree },
                    { selector: layoutAlgorithmSelector, value: layoutAlgorithm },
                    { selector: radialMetricsSelector, value: { areaMetric: "rloc", colorMetric: "mcc" } },
                    { selector: radialColoringSelector, value: TEST_COLORING },
                    { selector: hoveredNodePathSelector, value: null },
                    { selector: selectedNodePathSelector, value: selectedPath },
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

describe("RadialMapComponent", () => {
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

    it("should draw the radial treemap in its layout and the sunburst in the sunburst layout", async () => {
        // Arrange
        const { store, fixture } = await setup({ layoutAlgorithm: LayoutAlgorithm.RadialTreeMap })
        const radialTreemapSeries = lastDrawnOption().series[0].type

        // Act
        store.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.Sunburst)
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(radialTreemapSeries).toBe("custom")
        expect(lastDrawnOption().series[0].type).toBe("sunburst")
    })

    it("should keep the centre for a selected file the radial treemap shows as a cell four levels down", async () => {
        // Arrange
        const deepTree = folderNode("/root", [
            folderNode("/root/a", [folderNode("/root/a/b", [folderNode("/root/a/b/c", [fileNode("/root/a/b/c/d.ts")])])])
        ])
        const { store, fixture } = await setup({ tree: deepTree, layoutAlgorithm: LayoutAlgorithm.RadialTreeMap })

        // Act
        store.overrideSelector(selectedNodePathSelector, "/root/a/b/c/d.ts")
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(lastDrawnCentre()).toBe("/root")
    })

    it("should centre on the folder of a selected file when a layout that draws fewer levels no longer shows it", async () => {
        // Arrange
        const deepTree = folderNode("/root", [
            folderNode("/root/a", [folderNode("/root/a/b", [folderNode("/root/a/b/c", [fileNode("/root/a/b/c/d.ts")])])])
        ])
        const { store, fixture } = await setup({
            tree: deepTree,
            layoutAlgorithm: LayoutAlgorithm.RadialTreeMap,
            selectedPath: "/root/a/b/c/d.ts"
        })

        // Act
        store.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.Sunburst)
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(lastDrawnCentre()).toBe("/root/a/b/c")
    })

    it("should centre on the selected folder, and on the folder of a selected file", async () => {
        // Arrange
        const { store, fixture } = await setup({ selectedPath: "/root/src" })
        const centredOnFolder = lastDrawnCentre()

        // Act
        store.overrideSelector(selectedNodePathSelector, "/root/src/app/file.ts")
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
        store.overrideSelector(selectedNodePathSelector, "/root/src/b.ts")
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: "/root/src/b.ts" }))
        expect(lastDrawnCentre()).toBe("/root")
    })

    it("should centre on the folder of a file selected elsewhere that the rings do not show", async () => {
        // Arrange
        const { store, fixture } = await setup({ selectedPath: "/root/src/app" })
        store.overrideSelector(selectedNodePathSelector, null)
        store.refreshState()
        fixture.detectChanges()

        // Act
        store.overrideSelector(selectedNodePathSelector, "/root/src/b.ts")
        store.refreshState()
        fixture.detectChanges()

        // Assert
        expect(lastDrawnCentre()).toBe("/root/src")
    })

    it("should keep its centre when the selection is cleared", async () => {
        // Arrange
        const { store, fixture } = await setup({ selectedPath: "/root/src" })

        // Act
        store.overrideSelector(selectedNodePathSelector, null)
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
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: "/root/src" }))
    })

    it("should select the parent folder when the centre is clicked", async () => {
        // Arrange
        const { store } = await setup({ selectedPath: "/root/src/app" })

        // Act
        fireChartEvent("click", { data: { name: "/root/src/app", isCentre: true } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: "/root/src" }))
    })

    it("should go up to the real parent of a merged folder chain", async () => {
        // Arrange
        const mergedChain = folderNode("/root", [folderNode("/root/src/main", [fileNode("/root/src/main/a.ts")])])
        const { store } = await setup({ tree: mergedChain, selectedPath: "/root/src/main" })

        // Act
        fireChartEvent("click", { data: { name: "/root/src/main", isCentre: true } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: "/root" }))
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
                value: { nodeId: "/root/src", xPositionOfRightClickEvent: 7, yPositionOfRightClickEvent: 8, origin: "radialMap" }
            })
        )
    })

    it("should share the hovered folder with the rest of the app", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        fireChartEvent("mouseover", { data: { name: "/root/src" } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodePath({ value: "/root/src" }))
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
