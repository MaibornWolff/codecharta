import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { edgesSelector } from "../../../../lenses/dependency/dependencyLens.facade"
import { Edge } from "../../../../model/codeCharta.model"
import { LeveledNode } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import {
    fireChartEvent,
    fireRenderSurfaceEvent,
    lastDrawnOption,
    resetStubbedChart,
    stubbedChart,
    stubElementSize,
    stubResizeObserver
} from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { FileStoreReadWindow, isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { hoveredNodePathSelector, selectedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodePath, setRightClickedNodeData, setSelectedNodePath } from "../../../../stores/sharedView/sharedView.write.facade"
import { dependencyTreeSelector } from "../../selectors/dependencyMap.selectors"
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
    { fromNodeName: "/root/ui/view.ts", toNodeName: "/root/model/node.ts", attributes: {} },
    { fromNodeName: "/root/model/node.ts", toNodeName: "/root/ui/view.ts", attributes: {}, isPointingUpwards: true, isCyclic: true }
]

interface Setup {
    tree?: LeveledNode | null
    selectedPath?: string | null
    isDeltaState?: boolean
}

async function setup({ tree = TREE, selectedPath = null, isDeltaState = false }: Setup = {}) {
    const rendered = await render(DependencyMapComponent, {
        providers: [
            provideMockStore({
                initialState: defaultState,
                selectors: [
                    { selector: dependencyTreeSelector, value: tree },
                    { selector: edgesSelector, value: EDGES },
                    { selector: hoveredNodePathSelector, value: null },
                    { selector: selectedNodePathSelector, value: selectedPath },
                    { selector: isDeltaStateSelector, value: isDeltaState }
                ]
            }),
            { provide: State, useValue: { getValue: () => defaultState } },
            { provide: FileStoreReadWindow, useValue: { isLoadingFile$: of(false) } }
        ]
    })
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

    it("should draw a first look at the tree, higher levels above lower ones", async () => {
        // Act
        await setup()

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/ui/view.ts", "/root/model", "/root/model/node.ts"])
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

    it("should draw only the edges of the picked filter", async () => {
        // Arrange
        await setup()

        // Act
        fireEvent.click(screen.getByTestId("dependency-edge-filter-feedback"))
        await screen.findByTestId("dependency-graph")

        // Assert
        expect(drawnEdgeIndices()).toHaveLength(1)
        expect(screen.getByTestId("dependency-edge-filter-feedback").getAttribute("aria-pressed")).toBe("true")
    })

    it("should zoom back out to the whole graph from the toolbox", async () => {
        // Arrange
        await setup()

        // Act
        fireEvent.click(screen.getByTestId("dependency-reset-view"))

        // Assert
        expect(stubbedChart.dispatchAction).toHaveBeenCalledWith(expect.objectContaining({ type: "dataZoom" }))
    })

    it("should explain the four edge colours", async () => {
        // Act
        await setup()

        // Assert
        const legend = screen.getByRole("list", { name: "Edge colours" })
        expect(legend.textContent).toContain("Points upward and closes a cycle")
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
        // Act
        await setup({ isDeltaState: true })

        // Assert
        expect(screen.getByText(/Leave compare mode/)).not.toBeNull()
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })

    it("should say so when no file carries dependency levels", async () => {
        // Act
        await setup({ tree: null })

        // Assert
        expect(screen.getByText("No file in view carries dependency levels.")).not.toBeNull()
    })

    it("should leave a hidden folder and its edges out of the graph", async () => {
        // Arrange
        const { fixture } = await setup()

        // Act
        TestBed.inject(DependencyMapViewStore).hide("/root/model")
        fixture.detectChanges()
        await screen.findByTestId("dependency-graph")

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/ui/view.ts"])
        expect(drawnEdgeIndices()).toHaveLength(0)
    })

    it("should redraw the edges in the style the reader picks, bowing a dependency that runs both ways when straight", async () => {
        // Arrange
        await setup()

        // Act
        fireEvent.change(screen.getByTestId("dependency-edge-style"), { target: { value: "straight" } })
        await screen.findByTestId("dependency-graph")

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

    it("should move a dragged box, offer to reset the layout and put it back", async () => {
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
        await screen.findByTestId("dependency-reset-layout")
        const moved = drawnX("/root/ui/view.ts")
        fireEvent.click(screen.getByTestId("dependency-reset-layout"))
        await screen.findByTestId("dependency-graph")

        // Assert
        expect(moved).toBeLessThan(before)
        expect(drawnX("/root/ui/view.ts")).toBe(before)
        expect(screen.queryByTestId("dependency-reset-layout")).toBeNull()
    })

    it("should paint a dragged folder with its content over the folders beside it", async () => {
        // Arrange
        await setup()

        // Act
        fireChartEvent("mousedown", { ...boxEvent("/root/ui"), event: { offsetX: 0, offsetY: 0, event: { button: 0 } } })
        fireRenderSurfaceEvent("mousemove", { offsetX: 0, offsetY: 40, target: {} })
        fireRenderSurfaceEvent("mouseup")
        await screen.findByTestId("dependency-reset-layout")

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/model", "/root/model/node.ts", "/root/ui", "/root/ui/view.ts"])
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
        await screen.findByTestId("dependency-reset-layout")
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
        expect(await screen.findByTestId("dependency-reset-layout")).not.toBeNull()
    })

    it("should never drag the root, so its empty space pans the view", async () => {
        // Arrange
        await setup()

        // Act
        fireChartEvent("mousedown", { ...boxEvent("/root"), event: { offsetX: 5, offsetY: 5, event: { button: 0 } } })
        fireRenderSurfaceEvent("mousemove", { offsetX: 90, offsetY: 90, target: {} })
        fireRenderSurfaceEvent("mouseup")

        // Assert
        expect(screen.queryByTestId("dependency-reset-layout")).toBeNull()
    })
})
