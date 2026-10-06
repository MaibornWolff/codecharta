import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DEPENDENCY_EDGE_TYPES } from "../../../../model/dependencyGraph.model"
import {
    fireChartEvent,
    fireRenderSurfaceEvent,
    lastDrawnOption,
    reportResize,
    resetStubbedChart,
    stubbedChart,
    stubElementSize,
    stubResizeObserver
} from "../../testing/dependencyGraph.stub"
import { AxisWindow, fitWindowOf } from "../../util/axisWindow"
import { TOGGLE_INFO } from "../../util/dependencyGraphBoxes"
import { DependencyGraphScene } from "../../util/dependencyGraphScene"
import { GRAPH_SERIES_ID } from "../../util/dependencyGraphSeries"
import { aBox, DEFAULT_LOOKS } from "../../util/dependencyGraphTestData"
import { DependencyGraphComponent } from "./dependencyGraph.component"

jest.mock("echarts/core", () => jest.requireActual("../../testing/dependencyGraph.stub").echartsCoreStub)

const SCENE: DependencyGraphScene = {
    layout: { boxes: [aBox("/root/a.ts")], bands: [], width: 160, height: 40 },
    edges: [],
    edgeMetric: "dependencies",
    shownEdgeTypes: DEPENDENCY_EDGE_TYPES,
    ...DEFAULT_LOOKS,
    edgeStyle: "curved",
    isAnchoredAtSideMiddle: false,
    edgeWidth: { thickness: "byCount", factor: 1 },
    raisedPaths: [],
    draggingPath: null,
    searchedPaths: null,
    hoveredPath: null,
    selectedPath: null
}

const GRAPH_IDENTITY = "project A"

const GROWN_SCENE: DependencyGraphScene = {
    ...SCENE,
    layout: { boxes: [aBox("/root/a.ts", { width: 2000, height: 900 })], bands: [], width: 2000, height: 900 }
}

const FOLDER = "/root/app"
const CLOSED_FOLDER_SCENE: DependencyGraphScene = {
    ...SCENE,
    layout: { boxes: [aBox(FOLDER, { kind: "folder", x: 200, y: 150 })], bands: [], width: 400, height: 200 }
}

function sceneWithOpenedFolder(extent: { x: number; y: number; width: number; height: number }): DependencyGraphScene {
    const openedFolder = aBox(FOLDER, { kind: "folder", isExpanded: true, ...extent })
    return { ...SCENE, layout: { boxes: [openedFolder], bands: [], width: 2400, height: 1200 } }
}

const TOGGLE_OF_THE_FOLDER = { seriesId: GRAPH_SERIES_ID, name: FOLDER, info: TOGGLE_INFO }

const PANNED_AND_ZOOMED = (_finder: unknown, [x, y]: number[]) => [x / 2 + 100, y / 2 + 100]
const PANNED_AND_ZOOMED_WINDOW: AxisWindow = { x: [100, 500], y: [100, 400] }

interface ZoomOption {
    startValue: number
    endValue: number
}

function shownWindowOf({ dataZoom: [xZoom, yZoom] }: { dataZoom: ZoomOption[] }): AxisWindow {
    return { x: [xZoom.startValue, xZoom.endValue], y: [yZoom.startValue, yZoom.endValue] }
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
        // Arrange
        const inputs = { scene: SCENE, graphIdentity: GRAPH_IDENTITY }

        // Act
        await render(DependencyGraphComponent, { inputs })

        // Assert
        expect(lastDrawnOption().series[0].data[0].name).toBe("/root/a.ts")
    })

    it("should not draw into a container that has no size yet", async () => {
        // Arrange
        measuredSize = { width: 0, height: 0 }

        // Act
        await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })

        // Assert
        expect(stubbedChart.setOption).not.toHaveBeenCalled()
    })

    it("should pass the chart's clicks, toggles, hovers and right clicks on", async () => {
        // Arrange
        const boxClicked = jest.fn()
        const boxToggled = jest.fn()
        const cycleBadgeClicked = jest.fn()
        const edgeClicked = jest.fn()
        const boxHovered = jest.fn()
        const boxRightClicked = jest.fn()
        const rendered = jest.fn()
        await render(DependencyGraphComponent, {
            inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY },
            on: { boxClicked, boxToggled, cycleBadgeClicked, edgeClicked, boxHovered, boxRightClicked, rendered }
        })
        const box = { seriesId: GRAPH_SERIES_ID, name: "/root/a.ts" }

        // Act
        fireChartEvent("click", box)
        screen.getByTestId("dependency-graph").dispatchEvent(new MouseEvent("dblclick"))
        fireChartEvent("click", { ...box, info: "cycleBadge" })
        fireChartEvent("click", { seriesId: GRAPH_SERIES_ID, data: { isEdge: true, edgeId: "/root/a.ts|/root/b.ts" } })
        fireChartEvent("mouseover", box)
        fireChartEvent("contextmenu", { ...box, event: { event: { clientX: 1, clientY: 2 } } })
        fireChartEvent("finished")

        // Assert
        expect(boxClicked).toHaveBeenCalledWith("/root/a.ts")
        expect(boxToggled).toHaveBeenCalledWith("/root/a.ts")
        expect(cycleBadgeClicked).toHaveBeenCalledWith("/root/a.ts")
        expect(edgeClicked).toHaveBeenCalledWith("/root/a.ts|/root/b.ts")
        expect(boxHovered).toHaveBeenCalledWith("/root/a.ts")
        expect(boxRightClicked).toHaveBeenCalledWith({ path: "/root/a.ts", clientX: 1, clientY: 2 })
        expect(rendered).toHaveBeenCalled()
    })

    describe("keyboard", () => {
        const KEYBOARD_SCENE: DependencyGraphScene = {
            ...SCENE,
            selectedPath: "/root/app",
            layout: {
                boxes: [
                    aBox("/root/app", { kind: "folder", isExpanded: true, depth: 0, parentPath: null }),
                    aBox("/root/app/a.ts", { declarationCount: 2 }),
                    aBox("/root/app/b.ts", { declarationCount: 0 })
                ],
                bands: [],
                width: 400,
                height: 200
            }
        }

        async function renderBoxes() {
            const handlers = { boxClicked: jest.fn(), boxToggled: jest.fn(), boxHovered: jest.fn(), boxFocused: jest.fn() }
            await render(DependencyGraphComponent, { inputs: { scene: KEYBOARD_SCENE, graphIdentity: GRAPH_IDENTITY }, on: handlers })
            return handlers
        }

        it("should offer every box to the keyboard, named by its kind, saying whether it is open and which one is selected", async () => {
            // Arrange
            await renderBoxes()

            // Act
            const boxes = screen.getAllByRole("button")

            // Assert
            expect(boxes.map(box => box.getAttribute("aria-label"))).toEqual(["Folder app", "File a.ts", "File b.ts"])
            expect(boxes.map(box => box.getAttribute("aria-expanded"))).toEqual(["true", "false", null])
            expect(boxes.map(box => box.getAttribute("aria-pressed"))).toEqual(["true", "false", "false"])
        })

        it("should mark the focused box as the pointer would, until the focus leaves it", async () => {
            // Arrange
            const { boxHovered } = await renderBoxes()
            const file = screen.getByRole("button", { name: "File a.ts" })

            // Act
            file.focus()
            file.blur()

            // Assert
            expect(boxHovered.mock.calls).toEqual([["/root/app/a.ts"], [null]])
        })

        it("should be one stop for the tab key, at the selected box, and move on with the arrow keys", async () => {
            // Arrange
            const { boxFocused } = await renderBoxes()
            const tabStops = () => screen.getAllByRole("button").map(box => box.getAttribute("tabindex"))
            const atFirst = tabStops()

            // Act
            screen.getByRole("button", { name: "Folder app" }).focus()
            await userEvent.setup().keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowUp}")

            // Assert
            expect(atFirst).toEqual(["0", "-1", "-1"])
            expect(document.activeElement).toBe(screen.getByRole("button", { name: "File a.ts" }))
            expect(boxFocused.mock.calls.map(([path]) => path)).toEqual(["/root/app", "/root/app/a.ts", "/root/app/b.ts", "/root/app/a.ts"])
        })

        it("should select the focused box on Enter and open or close it on Space, without selecting it", async () => {
            // Arrange
            const { boxClicked, boxToggled } = await renderBoxes()
            const user = userEvent.setup()

            // Act
            screen.getByRole("button", { name: "File a.ts" }).focus()
            await user.keyboard("{Enter}")
            await user.keyboard(" ")

            // Assert
            expect(boxClicked.mock.calls).toEqual([["/root/app/a.ts"]])
            expect(boxToggled.mock.calls).toEqual([["/root/app/a.ts"]])
        })

        it("should leave a box that cannot be opened alone on Space", async () => {
            // Arrange
            const { boxClicked, boxToggled } = await renderBoxes()

            // Act
            screen.getByRole("button", { name: "File b.ts" }).focus()
            await userEvent.setup().keyboard(" ")

            // Assert
            expect(boxToggled).not.toHaveBeenCalled()
            expect(boxClicked).not.toHaveBeenCalled()
        })
    })

    it("should fit a new graph into view with its first drawing", async () => {
        // Arrange
        const inputs = { scene: SCENE, graphIdentity: GRAPH_IDENTITY }

        // Act
        await render(DependencyGraphComponent, { inputs })

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(fitWindowOf(SCENE.layout, measuredSize))
        expect(stubbedChart.dispatchAction).not.toHaveBeenCalled()
    })

    it("should keep the reader's zoom and position when a redraw grows the graph", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)

        // Act
        fixture.componentRef.setInput("scene", GROWN_SCENE)
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(PANNED_AND_ZOOMED_WINDOW)
    })

    it("should keep a box the reader opens at its spot on screen when the graph is laid out anew", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, {
            inputs: { scene: CLOSED_FOLDER_SCENE, graphIdentity: GRAPH_IDENTITY }
        })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        fireChartEvent("click", TOGGLE_OF_THE_FOLDER)

        // Act
        fixture.componentRef.setInput("scene", sceneWithOpenedFolder({ x: 260, y: 180, width: 200, height: 120 }))
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual({ x: [160, 560], y: [130, 430] })
    })

    it("should show an opened box whole when it is too large for the shown window", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, {
            inputs: { scene: CLOSED_FOLDER_SCENE, graphIdentity: GRAPH_IDENTITY }
        })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        fireChartEvent("click", TOGGLE_OF_THE_FOLDER)
        const openedScene = sceneWithOpenedFolder({ x: 260, y: 180, width: 2000, height: 900 })

        // Act
        fixture.componentRef.setInput("scene", openedScene)
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(fitWindowOf(openedScene.layout, measuredSize))
    })

    it("should leave the shown window alone when a later layout no longer toggles the box", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, {
            inputs: { scene: CLOSED_FOLDER_SCENE, graphIdentity: GRAPH_IDENTITY }
        })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        fireChartEvent("click", { seriesId: GRAPH_SERIES_ID, name: "/root/unknown", info: TOGGLE_INFO })
        fireChartEvent("click", TOGGLE_OF_THE_FOLDER)
        const movedButStillClosed = {
            ...CLOSED_FOLDER_SCENE,
            layout: { ...CLOSED_FOLDER_SCENE.layout, boxes: [aBox(FOLDER, { kind: "folder", x: 900 })] }
        }

        // Act
        fixture.componentRef.setInput("scene", movedButStillClosed)
        fixture.detectChanges()
        fixture.componentRef.setInput("scene", sceneWithOpenedFolder({ x: 260, y: 180, width: 200, height: 120 }))
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(PANNED_AND_ZOOMED_WINDOW)
    })

    it("should keep the scale and centre of the shown window when the container is resized", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        measuredSize = { width: 400, height: 600 }

        // Act
        reportResize()
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual({ x: [200, 400], y: [100, 400] })
    })

    it("should fit a graph of other files into view although its root keeps the same path", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)

        // Act
        fixture.componentRef.setInput("scene", GROWN_SCENE)
        fixture.componentRef.setInput("graphIdentity", "project B")
        fixture.detectChanges()

        // Assert
        expect(shownWindowOf(lastDrawnOption())).toEqual(fitWindowOf(GROWN_SCENE.layout, measuredSize))
    })

    it("should fit the graph anew once what covers its bottom is measured, and leave the view alone when that changes later", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)

        // Act
        fixture.componentRef.setInput("coveredBottom", 80)
        fixture.detectChanges()
        const onceMeasured = shownWindowOf(lastDrawnOption())
        fixture.componentRef.setInput("coveredBottom", 120)
        fixture.detectChanges()

        // Assert
        expect(onceMeasured).toEqual(fitWindowOf(SCENE.layout, { ...measuredSize, coveredBottom: 80 }))
        expect(shownWindowOf(lastDrawnOption())).toEqual(PANNED_AND_ZOOMED_WINDOW)
    })

    it("should fit the whole graph once for each new fit request", async () => {
        // Arrange
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        fixture.componentRef.setInput("fitRequest", 1)
        fixture.componentRef.setInput("scene", GROWN_SCENE)
        fixture.detectChanges()
        const windowOnRequest = shownWindowOf(lastDrawnOption())

        // Act
        fixture.componentRef.setInput("scene", { ...GROWN_SCENE, hoveredPath: "/root/a.ts" })
        fixture.detectChanges()

        // Assert
        expect(windowOnRequest).toEqual(fitWindowOf(GROWN_SCENE.layout, measuredSize))
        expect(shownWindowOf(lastDrawnOption())).toEqual(PANNED_AND_ZOOMED_WINDOW)
    })

    it("should move to the boxes it is asked to bring into view, once per request, and stay put when they are in view already", async () => {
        // Arrange
        const far = aBox("/root/far.ts", { x: 5000, y: 5000 })
        const inView = aBox("/root/inView.ts", { x: 200, y: 200 })
        const scene = { ...SCENE, layout: { ...SCENE.layout, boxes: [...SCENE.layout.boxes, far, inView] } }
        const { fixture } = await render(DependencyGraphComponent, { inputs: { scene, graphIdentity: GRAPH_IDENTITY } })
        stubbedChart.convertFromPixel.mockImplementation(PANNED_AND_ZOOMED)
        const centreOf = ({ x, y }: AxisWindow) => [(x[0] + x[1]) / 2, (y[0] + y[1]) / 2]

        // Act
        fixture.componentRef.setInput("viewRequest", { id: 1, paths: [far.path] })
        fixture.detectChanges()
        const onRequest = shownWindowOf(lastDrawnOption())
        fixture.componentRef.setInput("scene", { ...scene, hoveredPath: far.path })
        fixture.detectChanges()
        const afterAnotherDrawing = shownWindowOf(lastDrawnOption())
        fixture.componentRef.setInput("viewRequest", { id: 2, paths: [inView.path] })
        fixture.detectChanges()

        // Assert
        expect(centreOf(onRequest)).toEqual([5080, 5020])
        expect(afterAnotherDrawing).toEqual(PANNED_AND_ZOOMED_WINDOW)
        expect(shownWindowOf(lastDrawnOption())).toEqual(PANNED_AND_ZOOMED_WINDOW)
    })

    it("should report the end of a drag", async () => {
        // Arrange
        const boxDragEnded = jest.fn()
        await render(DependencyGraphComponent, {
            inputs: { scene: SCENE, graphIdentity: GRAPH_IDENTITY, canDragBox: () => true },
            on: { boxDragEnded }
        })

        // Act
        fireChartEvent("mousedown", { seriesId: GRAPH_SERIES_ID, name: "/root/a.ts", event: { offsetX: 0, offsetY: 0 } })
        fireRenderSurfaceEvent("mouseup")

        // Assert
        expect(boxDragEnded).toHaveBeenCalled()
    })
})
