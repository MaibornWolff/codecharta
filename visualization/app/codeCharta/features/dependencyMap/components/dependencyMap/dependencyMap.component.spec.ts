import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { fireEvent, screen } from "@testing-library/angular"
import { DependencyGraphComponent } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { fireChartEvent, stubbedChart } from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import {
    setHoveredNodePath,
    setRightClickedNodeData,
    setSelectedNodePath,
    unfocusNode
} from "../../../../stores/sharedView/sharedView.write.facade"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import {
    boxEvent,
    changeSettings,
    clickBox,
    doubleClickBox,
    drawnBoxPaths,
    drawnEdgeIndices,
    drawnSeries,
    EVERY_FOLDER,
    leveledFile,
    leveledFolder,
    outlineWidthOf,
    setup,
    stubTheGraphChart
} from "./dependencyMap.component.mocks"

jest.mock("echarts/core", () => jest.requireActual("../../../../renderer/dependencyGraph/testing/dependencyGraph.stub").echartsCoreStub)

function drawnLevelLabels(): string[] {
    const { data, renderItem } = drawnSeries()
    return data
        .flatMap((_item, dataIndex) => renderItem({ dataIndex }, { coord: point => point })?.children ?? [])
        .map(child => String(child.style?.text ?? ""))
        .filter(text => text.startsWith("level "))
}

describe("DependencyMapComponent", () => {
    stubTheGraphChart()

    it("should start with every folder closed", async () => {
        // Arrange
        const openedBoxes: string[] = []

        // Act
        await setup({ openedBoxes })

        // Assert
        expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/model"])
    })

    it("should draw the files of the opened folders, higher levels above lower ones", async () => {
        // Arrange
        const openedBoxes = EVERY_FOLDER

        // Act
        await setup({ openedBoxes })

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
        await setup({ tree, selectedPath: "/root/lib", openedBoxes: [] })

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

    it("should select, hover and open the context menu through the shared view state", async () => {
        // Arrange
        const { store } = await setup()

        // Act
        clickBox(boxEvent("/root/ui/view.ts"))
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

    it.each([
        [true, "outline the box under the pointer"],
        [false, "draw the box under the pointer like any other once the hover highlight is off"]
    ])("should, with the hover highlight %s, %s", async (isHoverHighlighted, _behaviour) => {
        // Arrange
        const { store, fixture } = await setup()
        await changeSettings(store, { isHoverHighlighted })
        fixture.detectChanges()
        const plainOutlineWidth = outlineWidthOf("/root/ui")

        // Act
        fireChartEvent("mouseover", boxEvent("/root/ui"))
        fixture.detectChanges()

        // Assert
        expect(outlineWidthOf("/root/ui") !== plainOutlineWidth).toBe(isHoverHighlighted)
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

    it("should label each level by its own number, also the levels nested in an opened folder", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(drawnLevelLabels()).toEqual(["level 1", "level 0", "level 0", "level 0"])
    })

    it("should redraw the edges in the style the reader picks, bowing a dependency that runs both ways when straight", async () => {
        // Arrange
        const { store, fixture } = await setup()

        // Act
        await changeSettings(store, { edgeShape: "straight" })
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
})
