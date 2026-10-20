import { TestBed } from "@angular/core/testing"
import { MockStore } from "@ngrx/store/testing"
import { screen, waitFor } from "@testing-library/angular"
import {
    fireChartEvent,
    fireRenderSurfaceEvent,
    lastDrawnOption,
    stubbedChart
} from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { dependencyTreeSelector } from "../../selectors/dependencyMap.selectors"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import {
    boxEvent,
    drawnBoxPaths,
    drawnSeries,
    leveledFile,
    leveledFolder,
    loadOtherFiles,
    setup,
    stubTheGraphChart
} from "./dependencyMap.component.mocks"

jest.mock("echarts/core", () => jest.requireActual("../../../../renderer/dependencyGraph/testing/dependencyGraph.stub").echartsCoreStub)

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

describe("DependencyMapComponent", () => {
    stubTheGraphChart()

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
        const { store } = await setup({ openedBoxes: [] })
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
