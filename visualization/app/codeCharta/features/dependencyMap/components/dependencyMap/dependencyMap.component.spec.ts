import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen, waitFor } from "@testing-library/angular"
import { of } from "rxjs"
import { edgesSelector, hasDependencyDataSelector } from "../../../../lenses/dependency/dependencyLens.facade"
import { Edge } from "../../../../model/codeCharta.model"
import { DependencyGraphSettings } from "../../../../model/dependencyGraph.model"
import { DependencyGraphComponent, LeveledNode } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import {
    fireChartEvent,
    fireRenderSurfaceEvent,
    lastDrawnOption,
    resetStubbedChart,
    stubbedChart,
    stubElementSize,
    stubResizeObserver
} from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultDependencyGraphSettings, dependencyGraphSettingsSelector } from "../../../../stores/preferences/preferences.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { hoveredNodePathSelector, selectedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import {
    setHoveredNodePath,
    setRightClickedNodeData,
    setSelectedNodePath,
    unfocusNode
} from "../../../../stores/sharedView/sharedView.write.facade"
import { clearPendingHeavyDispatch, isPendingHeavyDispatch$ } from "../../../../util/dispatchAfterPaint"
import {
    dependencyLayoutIdentitySelector,
    dependencySearchedPathsOrNullSelector,
    dependencyTreeSelector,
    isDependencyMapFocusedSelector
} from "../../selectors/dependencyMap.selectors"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { DependencyMapComponent } from "./dependencyMap.component"

jest.mock("echarts/core", () => jest.requireActual("../../../../renderer/dependencyGraph/testing/dependencyGraph.stub").echartsCoreStub)

function leveledFile(path: string, level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, isFolder: false, children: [] }
}

function leveledFolder(path: string, children: LeveledNode[], level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, isFolder: true, children }
}

const TREE = leveledFolder("/root", [
    leveledFolder("/root/ui", [leveledFile("/root/ui/view.ts")], 1),
    leveledFolder("/root/model", [leveledFile("/root/model/node.ts")])
])
const EDGES: Edge[] = [
    { fromNodeName: "/root/ui/view.ts", toNodeName: "/root/model/node.ts", attributes: { dependencies: 1 } },
    {
        fromNodeName: "/root/model/node.ts",
        toNodeName: "/root/ui/view.ts",
        attributes: { dependencies: 1 },
        isPointingUpwards: true,
        isCyclic: true
    },
    { fromNodeName: "/root/ui/view.ts", toNodeName: "/root/model/node.ts", attributes: { temporal_coupling: 0.5 } }
]

interface Setup {
    tree?: LeveledNode | null
    selectedPath?: string | null
    isDeltaState?: boolean
    searchedPaths?: ReadonlySet<string> | null
    hasDependencyData?: boolean
    isFocused?: boolean
    /** The graph starts with every folder closed; most tests look into them. */
    openedFolders?: string[]
}

const EVERY_FOLDER = ["/root/ui", "/root/model"]
const PROJECT_A = "project A"

async function setup({
    tree = TREE,
    selectedPath = null,
    isDeltaState = false,
    searchedPaths = null,
    hasDependencyData = true,
    isFocused = false,
    openedFolders = EVERY_FOLDER
}: Setup = {}) {
    const rendered = await render(DependencyMapComponent, {
        providers: [
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: dependencyTreeSelector, value: tree },
                    { selector: edgesSelector, value: EDGES },
                    { selector: edgeMetricSelector, value: "dependencies" },
                    { selector: hoveredNodePathSelector, value: null },
                    { selector: selectedNodePathSelector, value: selectedPath },
                    { selector: isDeltaStateSelector, value: isDeltaState },
                    { selector: dependencySearchedPathsOrNullSelector, value: searchedPaths },
                    { selector: dependencyLayoutIdentitySelector, value: PROJECT_A },
                    { selector: hasDependencyDataSelector, value: hasDependencyData },
                    { selector: isDependencyMapFocusedSelector, value: isFocused }
                ]
            }),
            { provide: State, useValue: { getValue: () => defaultState } },
            { provide: FileStoreReadWindow, useValue: { isLoadingFile$: of(false) } }
        ]
    })
    for (const folder of openedFolders) {
        TestBed.inject(DependencyMapViewStore).toggle(folder)
    }
    rendered.fixture.detectChanges()
    const store = TestBed.inject(MockStore)
    const markReady = jest.spyOn(TestBed.inject(ViewReadinessStore), "markReady")
    jest.spyOn(store, "dispatch")
    return { ...rendered, store, markReady }
}

interface DrawnSeries {
    id: string
    data: { name?: string; isEdge?: boolean }[]
    renderItem: (
        params: { dataIndex: number },
        api: { coord: (point: number[]) => number[] }
    ) => { children: { style: Record<string, unknown> }[] }
}

function drawnSeries(): DrawnSeries {
    return lastDrawnOption().series[0]
}

function drawnBoxPaths(): string[] {
    return drawnSeries()
        .data.map(item => item.name)
        .filter(name => name !== undefined)
}

function drawnEdgeIndices(): number[] {
    return drawnSeries().data.flatMap((item, index) => (item.isEdge ? [index] : []))
}

const boxEvent = (name: string) => ({ seriesId: "graph", name })

async function changeSettings(store: MockStore, settings: Partial<DependencyGraphSettings>) {
    store.overrideSelector(dependencyGraphSettingsSelector, { ...defaultDependencyGraphSettings, ...settings })
    store.refreshState()
    await screen.findByTestId("dependency-graph")
}

async function loadOtherFiles(store: MockStore, tree: LeveledNode = TREE) {
    store.overrideSelector(dependencyLayoutIdentitySelector, "project B")
    store.overrideSelector(dependencyTreeSelector, { ...tree })
    store.refreshState()
    await screen.findByTestId("dependency-graph")
}

async function excludeSoTheRootMoves(store: MockStore) {
    store.overrideSelector(dependencyTreeSelector, leveledFolder("/root/ui", [leveledFile("/root/ui/view.ts")]))
    store.refreshState()
    await screen.findByTestId("dependency-graph")
}

interface ZoomOption {
    startValue: number
    endValue: number
}

function shownWindowOf({ dataZoom: [xZoom, yZoom] }: { dataZoom: ZoomOption[] }) {
    return { x: [xZoom.startValue, xZoom.endValue], y: [yZoom.startValue, yZoom.endValue] }
}

function outlineWidthOf(path: string): unknown {
    const index = drawnSeries().data.findIndex(item => item.name === path)
    return drawnSeries().renderItem({ dataIndex: index }, { coord: point => point }).children[0].style.lineWidth
}

function landHeavyDispatch(store: MockStore, tree?: LeveledNode | null) {
    isPendingHeavyDispatch$.next(true)
    if (tree !== undefined) {
        store.overrideSelector(dependencyTreeSelector, tree)
    }
    store.overrideSelector(accumulatedDataSelector, { unifiedMapNode: undefined, unifiedFileMeta: undefined })
    store.refreshState()
}

function dragBox(path: string) {
    fireChartEvent("mousedown", { ...boxEvent(path), event: { offsetX: 0, offsetY: 0, event: { button: 0 } } })
    fireRenderSurfaceEvent("mousemove", { offsetX: -30, offsetY: 0, target: {} })
    fireRenderSurfaceEvent("mouseup")
}

function movedBoxCount(): number {
    return TestBed.inject(DependencyMapViewStore).boxOffsets().size
}

async function awaitMovedBoxes() {
    await waitFor(() => expect(movedBoxCount()).toBeGreaterThan(0))
}

function doubleClickBox(path: string) {
    fireChartEvent("click", boxEvent(path))
    screen.getByTestId("dependency-graph").dispatchEvent(new MouseEvent("dblclick"))
}

describe("DependencyMapComponent", () => {
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

    afterEach(() => {
        clearPendingHeavyDispatch()
    })

    it("should start with every folder closed", async () => {
        // Arrange
        const openedFolders: string[] = []

        // Act
        await setup({ openedFolders })

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/model"])
    })

    it("should draw the files of the opened folders, higher levels above lower ones", async () => {
        // Arrange
        const openedFolders = EVERY_FOLDER

        // Act
        await setup({ openedFolders })

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/model", "/root/ui/view.ts", "/root/model/node.ts"])
    })

    it("should fade the boxes the explorer's search missed", async () => {
        // Arrange
        await setup({ searchedPaths: new Set(["/root/ui"]) })

        // Act
        const series = drawnSeries()
        const opacityOf = (path: string) =>
            series.renderItem({ dataIndex: series.data.findIndex(item => item.name === path) }, { coord: point => point }).children[0].style
                .opacity

        // Assert
        expect(drawnBoxPaths().map(opacityOf)).toEqual([1, 1, 0.3, 1, 0.3])
    })

    it("should close an open folder on a double click and draw its edges on the folder", async () => {
        // Arrange
        await setup()

        // Act
        doubleClickBox("/root/model")
        await screen.findByTestId("dependency-graph")

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/ui/view.ts", "/root/model"])
        expect(drawnEdgeIndices()).toHaveLength(2)
    })

    it("should ignore a double click on a file", async () => {
        // Arrange
        await setup()
        const drawsBefore = stubbedChart.setOption.mock.calls.length

        // Act
        doubleClickBox("/root/ui/view.ts")

        // Assert
        expect(stubbedChart.setOption.mock.calls.length).toBe(drawsBefore)
    })

    it("should mark the box that stands for the selected node", async () => {
        // Arrange
        await setup({ selectedPath: "/root/model/node.ts" })

        // Act
        doubleClickBox("/root/model")
        await screen.findByTestId("dependency-graph")

        // Assert
        const modelIndex = drawnSeries().data.findIndex(item => item.name === "/root/model")
        const outline = drawnSeries().renderItem({ dataIndex: modelIndex }, { coord: point => point }).children[0].style
        expect(outline.lineWidth).toBe(2.5)
    })

    it("should mark the chain box when a folder folded into it is selected", async () => {
        // Arrange
        const chain = { ...leveledFolder("/root/lib/core", [leveledFile("/root/lib/core/io.ts")]), foldedPaths: ["/root/lib"] }
        const tree = leveledFolder("/root", [chain, leveledFolder("/root/ui", [leveledFile("/root/ui/view.ts")])])

        // Act
        await setup({ tree, selectedPath: "/root/lib", openedFolders: [] })

        // Assert
        expect(outlineWidthOf("/root/lib/core")).toBe(2.5)
    })

    it("should hand every request to fit the graph into view on to the graph", async () => {
        // Arrange
        const { fixture } = await setup()
        const graph = fixture.debugElement.query(By.directive(DependencyGraphComponent)).componentInstance as DependencyGraphComponent

        // Act
        TestBed.inject(DependencyMapViewStore).requestFit()
        fixture.detectChanges()

        // Assert
        expect(graph.fitRequest()).toBe(1)
    })

    it("should keep the spinner of an exclusion that changes the graph up until the graph is redrawn", async () => {
        // Arrange
        const { store, fixture } = await setup()
        const treeAfterExclusion = leveledFolder("/root", [leveledFolder("/root/ui", [leveledFile("/root/ui/view.ts")], 1)])

        // Act
        landHeavyDispatch(store, treeAfterExclusion)
        fixture.detectChanges()
        await screen.findByTestId("dependency-graph")
        const whileRedrawing = isPendingHeavyDispatch$.value
        fireChartEvent("finished")

        // Assert
        expect(whileRedrawing).toBe(true)
        expect(isPendingHeavyDispatch$.value).toBe(false)
    })

    it.each([
        ["leaves the graph as it is", undefined],
        ["empties the graph", null]
    ])("should take the spinner down as soon as an exclusion %s", async (_, treeAfterExclusion) => {
        // Arrange
        const { store } = await setup()

        // Act
        landHeavyDispatch(store, treeAfterExclusion)

        // Assert
        expect(isPendingHeavyDispatch$.value).toBe(false)
    })

    it("should take the spinner down as soon as an exclusion lands in compare mode", async () => {
        // Arrange
        const { store } = await setup({ isDeltaState: true })

        // Act
        landHeavyDispatch(store)

        // Assert
        expect(isPendingHeavyDispatch$.value).toBe(false)
    })

    it("should select, hover and open the context menu through the shared view state", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        fireChartEvent("click", boxEvent("/root/ui/view.ts"))
        fireChartEvent("mouseover", boxEvent("/root/ui"))
        fireChartEvent("contextmenu", { ...boxEvent("/root/ui"), event: { event: { clientX: 5, clientY: 6 } } })

        // Assert
        expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: "/root/ui/view.ts" }))
        expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodePath({ value: "/root/ui" }))
        expect(store.dispatch).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: { nodeId: "/root/ui", xPositionOfRightClickEvent: 5, yPositionOfRightClickEvent: 6, origin: "dependencyMap" }
            })
        )
    })

    it("should draw only the edges of the picked types", async () => {
        // Arrange
        const { store, fixture } = await setup()

        // Act
        await changeSettings(store, { shownEdgeTypes: ["feedbackContainerLevel", "feedbackLeafLevel"] })
        fixture.detectChanges()

        // Assert
        expect(drawnEdgeIndices()).toHaveLength(1)
    })

    it("should mark the view ready once the graph is drawn", async () => {
        // Arrange
        const { markReady } = await setup()

        // Act
        fireChartEvent("finished")

        // Assert
        expect(markReady).toHaveBeenCalledWith("dependencies")
    })

    it("should explain compare mode instead of drawing", async () => {
        // Arrange
        const isDeltaState = true

        // Act
        await setup({ isDeltaState })

        // Assert
        expect(screen.getByText(/Leave compare mode/)).not.toBeNull()
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })

    it("should say so when no file carries dependency levels", async () => {
        // Arrange
        const hasDependencyData = false

        // Act
        await setup({ tree: null, hasDependencyData })

        // Assert
        expect(screen.getByText("No file in view carries dependency levels.")).not.toBeNull()
    })

    it("should offer to unfocus when the focused folder holds nothing with dependency levels", async () => {
        // Arrange
        const { store } = await setup({ tree: null, isFocused: true })

        // Act
        fireEvent.click(screen.getByTestId("dependency-unfocus"))

        // Assert
        expect(screen.getByText("Nothing in the focused folder carries dependency levels.")).not.toBeNull()
        expect(store.dispatch).toHaveBeenCalledWith(unfocusNode())
    })

    it("should point to the Excluded list when every file with dependency levels is excluded", async () => {
        // Arrange
        const isFocused = false

        // Act
        await setup({ tree: null, isFocused })

        // Assert
        expect(screen.getByText(/Include some again from the Excluded list/)).not.toBeNull()
        expect(screen.queryByTestId("dependency-unfocus")).toBeNull()
    })

    it("should start over with every folder closed and nothing moved when other files with the same root are loaded", async () => {
        // Arrange
        const { store } = await setup()
        dragBox("/root/ui/view.ts")
        await awaitMovedBoxes()

        // Act
        await loadOtherFiles(store)

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/model"])
        expect(movedBoxCount()).toBe(0)
    })

    it("should fit the graph of newly loaded files into view", async () => {
        // Arrange
        const { store } = await setup({ openedFolders: [] })
        const [[fittedOnArrival]] = stubbedChart.setOption.mock.calls
        stubbedChart.convertFromPixel.mockImplementation((_finder: unknown, [x, y]: number[]) => [x / 2, y / 2])

        // Act
        await loadOtherFiles(store)

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(shownWindowOf(fittedOnArrival))
    })

    it("should keep the moved boxes when an exclusion moves the root of the tree", async () => {
        // Arrange
        const { store } = await setup()
        dragBox("/root/ui/view.ts")
        await awaitMovedBoxes()

        // Act
        await excludeSoTheRootMoves(store)

        // Assert
        expect(movedBoxCount()).toBeGreaterThan(0)
    })

    it("should redraw the edges in the style the reader picks, bowing a dependency that runs both ways when straight", async () => {
        // Arrange
        const { store, fixture } = await setup()

        // Act
        await changeSettings(store, { edgeStyle: "straight" })
        fixture.detectChanges()

        // Assert
        const drawnCurve = drawnSeries().renderItem({ dataIndex: drawnEdgeIndices()[0] }, { coord: point => point })
            .children[0] as unknown as {
            shape: { x1: number; y1: number; cpx1: number; cpy1: number; x2: number; y2: number }
        }
        // the two edges run both ways, so the straight style bows each one 14 px off the straight line
        const { x1, y1, cpx1, cpy1, x2, y2 } = drawnCurve.shape
        const distanceOffTheLine = Math.abs((cpx1 - x1) * (y2 - y1) - (cpy1 - y1) * (x2 - x1)) / Math.hypot(x2 - x1, y2 - y1)
        expect(distanceOffTheLine).toBeCloseTo(14)
    })

    it("should move a dragged box and put it back once the layout is reset", async () => {
        // Arrange
        await setup()
        const drawnX = (path: string) => {
            const boxes = drawnSeries()
            const index = boxes.data.findIndex(item => item.name === path)
            return (boxes.renderItem({ dataIndex: index }, { coord: point => point }).children[0] as unknown as { shape: { x: number } })
                .shape.x
        }
        const before = drawnX("/root/ui/view.ts")

        // Act
        fireChartEvent("mousedown", { ...boxEvent("/root/ui/view.ts"), event: { offsetX: 0, offsetY: 0, event: { button: 0 } } })
        fireRenderSurfaceEvent("mousemove", { offsetX: -30, offsetY: 0, target: {} })
        fireRenderSurfaceEvent("mouseup")
        await awaitMovedBoxes()
        const moved = drawnX("/root/ui/view.ts")
        TestBed.inject(DependencyMapViewStore).resetLayout()
        await screen.findByTestId("dependency-graph")

        // Assert
        expect(moved).toBeLessThan(before)
        expect(drawnX("/root/ui/view.ts")).toBe(before)
        expect(movedBoxCount()).toBe(0)
    })

    it("should paint a dragged folder with its content over the folders beside it", async () => {
        // Arrange
        await setup()

        // Act
        fireChartEvent("mousedown", { ...boxEvent("/root/ui"), event: { offsetX: 0, offsetY: 0, event: { button: 0 } } })
        fireRenderSurfaceEvent("mousemove", { offsetX: 0, offsetY: 40, target: {} })
        fireRenderSurfaceEvent("mouseup")
        await awaitMovedBoxes()

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/model", "/root/ui", "/root/model/node.ts", "/root/ui/view.ts"])
    })

    it("should draw a folder see-through while it is dragged and solid again once dropped", async () => {
        // Arrange
        await setup()
        const fillOf = (path: string) => {
            const index = drawnSeries().data.findIndex(item => item.name === path)
            return drawnSeries().renderItem({ dataIndex: index }, { coord: point => point }).children[0].style.fill
        }

        // Act
        fireChartEvent("mousedown", { ...boxEvent("/root/ui"), event: { offsetX: 0, offsetY: 0, event: { button: 0 } } })
        fireRenderSurfaceEvent("mousemove", { offsetX: 200, offsetY: 0, target: {} })
        await new Promise(resolve => requestAnimationFrame(resolve))
        await awaitMovedBoxes()
        const whileDragging = fillOf("/root/ui")
        fireRenderSurfaceEvent("mouseup")
        await screen.findByTestId("dependency-graph")

        // Assert
        expect(whileDragging).toMatch(/^rgba/)
        expect(fillOf("/root/ui")).toMatch(/^#/)
    })

    it("should drag an open folder grabbed deep inside it, not only by its header", async () => {
        // Arrange
        await setup()

        // Act
        fireChartEvent("mousedown", { ...boxEvent("/root/ui"), event: { offsetX: 150, offsetY: 400, event: { button: 0 } } })
        fireRenderSurfaceEvent("mousemove", { offsetX: 150, offsetY: 460, target: {} })
        fireRenderSurfaceEvent("mouseup")

        // Assert
        await awaitMovedBoxes()
    })

    it("should never drag the root, so its empty space pans the view", async () => {
        // Arrange
        await setup()

        // Act
        fireChartEvent("mousedown", { ...boxEvent("/root"), event: { offsetX: 5, offsetY: 5, event: { button: 0 } } })
        fireRenderSurfaceEvent("mousemove", { offsetX: 90, offsetY: 90, target: {} })
        fireRenderSurfaceEvent("mouseup")

        // Assert
        expect(movedBoxCount()).toBe(0)
    })
})
