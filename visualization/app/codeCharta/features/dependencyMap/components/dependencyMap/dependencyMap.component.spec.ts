import { TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { of } from "rxjs"
import {
    DependencyDeclarations,
    dependencyDeclarationsSelector,
    edgesSelector,
    hasDependencyDataSelector,
    hasNamespacesSelector
} from "../../../../lenses/dependency/dependencyLens.facade"
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
    return { path, name: path.split("/").pop(), level, kind: "file", children: [] }
}

function leveledFolder(path: string, children: LeveledNode[], level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, kind: "folder", children }
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

const VIEW = "/root/ui/view.ts"
const NODE = "/root/model/node.ts"

function leveledDeclaration(filePath: string, name: string): LeveledNode {
    return { path: `${filePath}/${name}`, name, level: 0, kind: "declaration", children: [], declarationKind: "class" }
}

const DECLARING_TREE = leveledFolder("/root", [
    leveledFolder(
        "/root/ui",
        [{ ...leveledFile(VIEW), children: [leveledDeclaration(VIEW, "View"), leveledDeclaration(VIEW, "Menu")] }],
        1
    ),
    leveledFolder("/root/model", [{ ...leveledFile(NODE), children: [leveledDeclaration(NODE, "Node")] }])
])
const NO_DECLARATIONS: DependencyDeclarations = { namespaces: {}, leaves: {}, leafEdges: [] }
const DECLARATIONS: DependencyDeclarations = {
    namespaces: {},
    leaves: {
        [VIEW]: { View: { name: "View", kind: "class" }, Menu: { name: "Menu", kind: "class" } },
        [NODE]: { Node: { name: "Node", kind: "class" } }
    },
    leafEdges: [
        { fromNodeName: VIEW, fromLeaf: "View", toNodeName: NODE, toLeaf: "Node", attributes: { dependencies: 1 }, usage: ["usage"] },
        { fromNodeName: VIEW, fromLeaf: "Menu", toNodeName: VIEW, toLeaf: "View", attributes: { dependencies: 1 }, usage: ["usage"] }
    ]
}

interface Setup {
    tree?: LeveledNode | null
    declarations?: DependencyDeclarations
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
    declarations = NO_DECLARATIONS,
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
                    { selector: dependencyDeclarationsSelector, value: declarations },
                    { selector: hasNamespacesSelector, value: Object.keys(declarations.namespaces).length > 0 },
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

function drawnLevelLabels(): string[] {
    const { data, renderItem } = drawnSeries()
    return data
        .flatMap((_item, dataIndex) => renderItem({ dataIndex }, { coord: point => point })?.children ?? [])
        .map(child => String(child.style?.text ?? ""))
        .filter(text => text.startsWith("level "))
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

    describe("with declarations", () => {
        const drawnEdgeCount = () => drawnEdgeIndices().length

        it("should open a file into its declarations on a double click and draw their edges, the one inside the file too", async () => {
            // Arrange
            await setup({ tree: DECLARING_TREE, declarations: DECLARATIONS })
            const edgesWhileClosed = drawnEdgeCount()

            // Act
            doubleClickBox(VIEW)
            await screen.findByTestId("dependency-graph")

            // Assert
            expect(edgesWhileClosed).toBe(2)
            expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", VIEW, "/root/model", `${VIEW}/Menu`, `${VIEW}/View`, NODE])
            expect(drawnEdgeCount()).toBe(3)
        })

        it("should open and close a file from its toggle", async () => {
            // Arrange
            await setup({ tree: DECLARING_TREE, declarations: DECLARATIONS })

            // Act
            fireChartEvent("click", { ...boxEvent(VIEW), info: "toggle" })
            await screen.findByTestId("dependency-graph")
            const opened = drawnBoxPaths()
            fireChartEvent("click", { ...boxEvent(VIEW), info: "toggle" })
            await screen.findByTestId("dependency-graph")

            // Assert
            expect(opened).toContain(`${VIEW}/View`)
            expect(drawnBoxPaths()).not.toContain(`${VIEW}/View`)
        })

        it("should arrange the declarations the way the reader set", async () => {
            // Arrange
            const { store, fixture } = await setup({ tree: DECLARING_TREE, openedFolders: [...EVERY_FOLDER, VIEW] })
            const drawnWidth = () => {
                const dataIndex = drawnSeries().data.findIndex(item => item.name === `${VIEW}/View`)
                const [outline] = drawnSeries().renderItem({ dataIndex }, { coord: point => point }).children
                return (outline as unknown as { shape: { width: number } }).shape.width
            }
            const stacked = drawnWidth()

            // Act
            await changeSettings(store, { declarationArrangement: "chips" })
            fixture.detectChanges()

            // Assert
            expect(stacked).toBe(132)
            expect(drawnWidth()).toBe(44)
        })

        it("should tell the other views the file of a selected, hovered or right-clicked declaration, and mark the declaration itself", async () => {
            // Arrange
            const { store, fixture } = await setup({
                tree: DECLARING_TREE,
                declarations: DECLARATIONS,
                openedFolders: [...EVERY_FOLDER, VIEW]
            })
            const declaration = boxEvent(`${VIEW}/View`)

            // Act
            fireChartEvent("click", declaration)
            fireChartEvent("mouseover", declaration)
            fireChartEvent("contextmenu", { ...declaration, event: { event: { clientX: 5, clientY: 6 } } })
            store.overrideSelector(selectedNodePathSelector, VIEW)
            store.refreshState()
            fixture.detectChanges()

            // Assert
            expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: VIEW }))
            expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodePath({ value: VIEW }))
            expect(store.dispatch).toHaveBeenCalledWith(
                setRightClickedNodeData({
                    value: { nodeId: VIEW, xPositionOfRightClickEvent: 5, yPositionOfRightClickEvent: 6, origin: "dependencyMap" }
                })
            )
            expect(outlineWidthOf(`${VIEW}/View`)).toBe(2.5)
            expect(outlineWidthOf(VIEW)).toBe(1)
        })

        describe("cycle badges", () => {
            const CYCLIC: DependencyDeclarations = {
                ...DECLARATIONS,
                leafEdges: [
                    ...DECLARATIONS.leafEdges.map(leafEdge => ({ ...leafEdge, isCyclic: true })),
                    {
                        fromNodeName: NODE,
                        fromLeaf: "Node",
                        toNodeName: VIEW,
                        toLeaf: "View",
                        attributes: { dependencies: 1 },
                        usage: [],
                        isCyclic: true
                    }
                ]
            }
            const badgeCountOf = (path: string) => {
                const dataIndex = drawnSeries().data.findIndex(item => item.name === path)
                const parts = drawnSeries().renderItem({ dataIndex }, { coord: point => point }).children as unknown as {
                    info?: string
                    style: { text?: string }
                }[]
                const badge = parts.filter(part => part.info === "cycleBadge")
                return badge.length === 0 ? null : (badge.find(part => part.style.text)?.style.text ?? "1")
            }

            it("should count on each closed file the cycles it hides a part of, and stop counting on a file once it is opened", async () => {
                // Arrange
                await setup({ tree: DECLARING_TREE, declarations: CYCLIC })
                const whileClosed = [VIEW, NODE].map(badgeCountOf)

                // Act
                doubleClickBox(VIEW)
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(whileClosed).toEqual(["1", "1"])
                expect([VIEW, NODE].map(badgeCountOf)).toEqual([null, "1"])
            })

            it("should draw no badge once the reader switches them off, or for another edge metric", async () => {
                // Arrange
                const { store, fixture } = await setup({ tree: DECLARING_TREE, declarations: CYCLIC })

                // Act
                await changeSettings(store, { showsCycleBadges: false })
                fixture.detectChanges()
                const switchedOff = badgeCountOf(VIEW)
                await changeSettings(store, { showsCycleBadges: true })
                store.overrideSelector(edgeMetricSelector, "temporal_coupling")
                store.refreshState()
                fixture.detectChanges()

                // Assert
                expect(switchedOff).toBeNull()
                expect(badgeCountOf(VIEW)).toBeNull()
            })

            it("should select the box whose badge is clicked", async () => {
                // Arrange
                const { store } = await setup({ tree: DECLARING_TREE, declarations: CYCLIC })

                // Act
                fireChartEvent("click", { ...boxEvent(VIEW), info: "cycleBadge" })

                // Assert
                expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: VIEW }))
            })
        })

        describe("panel", () => {
            const CYCLIC: DependencyDeclarations = {
                ...DECLARATIONS,
                leafEdges: [
                    ...DECLARATIONS.leafEdges.map(leafEdge => ({ ...leafEdge, isCyclic: true })),
                    {
                        fromNodeName: NODE,
                        fromLeaf: "Node",
                        toNodeName: VIEW,
                        toLeaf: "View",
                        attributes: { dependencies: 1 },
                        usage: [],
                        isCyclic: true
                    }
                ]
            }
            const EDGE_ID = `${VIEW}|${NODE}`

            async function setupSelected(selectedPath: string | null, declarations = CYCLIC) {
                return setup({ tree: DECLARING_TREE, declarations, selectedPath })
            }

            async function select(store: MockStore, fixture: { detectChanges: () => void }, path: string | null) {
                store.overrideSelector(selectedNodePathSelector, path)
                store.refreshState()
                fixture.detectChanges()
            }

            const panelTitle = () => screen.queryByTestId("dependency-panel-title")?.textContent.trim() ?? null
            const edgeOpacities = () =>
                Object.fromEntries(
                    drawnSeries().data.flatMap((item, dataIndex) => {
                        const parts = drawnSeries().renderItem({ dataIndex }, { coord: point => point }).children
                        return item.isEdge ? [[(item as { edgeId?: string }).edgeId, parts.at(-1).style.opacity]] : []
                    })
                )

            it("should explain the selected file beside the graph, and nothing while nothing is selected", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(null)
                const withoutSelection = panelTitle()

                // Act
                await select(store, fixture, VIEW)

                // Assert
                expect(withoutSelection).toBeNull()
                expect(panelTitle()).toBe("view.ts")
                expect(screen.getByRole("region", { name: "Declarations" }).textContent).toContain("Menu")
            })

            it("should stay away for a map that tells no declarations", async () => {
                // Act
                await setup({ selectedPath: "/root/ui/view.ts" })

                // Assert
                expect(panelTitle()).toBeNull()
            })

            it("should explain a clicked edge, clear the selection of the other views and mark the edge", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)

                // Act
                fireChartEvent("click", { seriesId: "graph", data: { isEdge: true, edgeId: EDGE_ID } })
                await select(store, fixture, null)

                // Assert
                expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: null }))
                expect(panelTitle()).toBe("view.ts → node.ts")
                const edgeIndex = drawnSeries().data.findIndex(item => (item as { edgeId?: string }).edgeId === EDGE_ID)
                expect(drawnSeries().renderItem({ dataIndex: edgeIndex }, { coord: point => point }).children).toHaveLength(3)
            })

            it("should unfold the selected edge into the declarations at its ends", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                fireChartEvent("click", { seriesId: "graph", data: { isEdge: true, edgeId: EDGE_ID } })
                await select(store, fixture, null)

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Unfold in graph" }))
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toEqual(expect.arrayContaining([`${VIEW}/View`, `${NODE}/Node`]))
                expect(panelTitle()).toBeNull()
            })

            it("should open and close the selected file from the panel", async () => {
                // Arrange
                const { fixture } = await setupSelected(VIEW)

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Open in graph" }))
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toContain(`${VIEW}/Menu`)
                expect(screen.getByRole("button", { name: "Close in graph" })).not.toBeNull()
            })

            it("should go to a declaration named in the panel: open its file, select it and tell the other views its file", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                const usedDeclaration = within(screen.getByRole("region", { name: "Uses" })).getByRole("button", { name: "Node" })

                // Act
                await userEvent.click(usedDeclaration)
                await select(store, fixture, NODE)

                // Assert
                expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: NODE }))
                expect(drawnBoxPaths()).toContain(`${NODE}/Node`)
                expect(TestBed.inject(DependencyMapViewStore).viewRequest().paths).toEqual([`${NODE}/Node`])
                expect(panelTitle()).toBe("Node")
                expect(screen.getByTestId("dependency-panel-badges").textContent).toContain("Class")
            })

            it("should light up the edge of the row under the pointer and let the others step back", async () => {
                // Arrange
                const { fixture } = await setupSelected(VIEW)
                const usesRow = within(screen.getByRole("region", { name: "Uses" }))
                    .getAllByTestId("dependency-panel-row")
                    .at(-1)

                // Act
                fireEvent.mouseEnter(usesRow)
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")
                const whilePointing = edgeOpacities()
                fireEvent.mouseLeave(usesRow)
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(whilePointing).toEqual({ [EDGE_ID]: 1, [`${NODE}|${VIEW}`]: 0.12 })
                expect(edgeOpacities()).toEqual({ [EDGE_ID]: 1, [`${NODE}|${VIEW}`]: 1 })
            })

            it("should show a cycle in the graph: open the files on it and light up its chain", async () => {
                // Arrange
                const { fixture } = await setupSelected(VIEW)
                const [cycle] = screen.getAllByTestId("dependency-panel-cycle")

                // Act
                await userEvent.click(within(cycle).getByRole("button", { name: "Show in graph" }))
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toEqual(expect.arrayContaining([`${VIEW}/View`, `${NODE}/Node`]))
                expect(edgeOpacities()).toMatchObject({ [`${VIEW}/View|${NODE}/Node`]: 1, [`${NODE}/Node|${VIEW}/View`]: 1 })
                expect(TestBed.inject(DependencyMapViewStore).viewRequest().paths).toEqual([`${VIEW}/View`, `${NODE}/Node`])
            })

            it("should bring the cycles into view when a cycle badge is clicked", async () => {
                // Arrange
                const scrollIntoView = jest.fn()
                Element.prototype.scrollIntoView = scrollIntoView
                const { fixture } = await setupSelected(VIEW)

                // Act
                fireChartEvent("click", { ...boxEvent(VIEW), info: "cycleBadge" })
                fixture.detectChanges()

                // Assert
                expect(scrollIntoView).toHaveBeenCalledTimes(1)
            })

            it("should close on request and come back with the next selection", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Close inspector" }))
                fixture.detectChanges()
                const afterClosing = panelTitle()
                fireChartEvent("click", boxEvent(NODE))
                await select(store, fixture, NODE)

                // Assert
                expect(afterClosing).toBeNull()
                expect(panelTitle()).toBe("node.ts")
            })

            it("should show every row of a hub once the reader asks for the ones left out", async () => {
                // Arrange
                const manyNames = Array.from({ length: 25 }, (_, index) => `Part${String(index).padStart(2, "0")}`)
                const hub: DependencyDeclarations = {
                    ...NO_DECLARATIONS,
                    leaves: { [VIEW]: Object.fromEntries(manyNames.map(name => [name, { name, kind: "class" }])) }
                }
                const { fixture } = await setupSelected(VIEW, hub)
                const declarationCount = () => screen.getByRole("region", { name: "Declarations" }).querySelectorAll("li").length
                const cut = declarationCount()

                // Act
                await userEvent.click(screen.getByRole("button", { name: "and 5 more" }))
                fixture.detectChanges()

                // Assert
                expect(cut).toBe(20)
                expect(declarationCount()).toBe(25)
            })
        })

        describe("by packages", () => {
            const PACKAGED: DependencyDeclarations = {
                namespaces: { app: { level: 0 }, "app.screens": { parent: "app", level: 1 }, "app.data": { parent: "app", level: 0 } },
                leaves: {
                    [VIEW]: {
                        View: { name: "View", kind: "class", namespace: "app.screens" },
                        Menu: { name: "Menu", kind: "class", namespace: "app.screens" }
                    },
                    [NODE]: { Node: { name: "Node", kind: "class", namespace: "app.data" } }
                },
                leafEdges: [
                    {
                        fromNodeName: VIEW,
                        fromLeaf: "View",
                        toNodeName: NODE,
                        toLeaf: "Node",
                        attributes: { dependencies: 1 },
                        usage: ["usage"]
                    },
                    {
                        fromNodeName: NODE,
                        fromLeaf: "Node",
                        toNodeName: VIEW,
                        toLeaf: "View",
                        attributes: { dependencies: 1 },
                        usage: ["usage"],
                        isCyclic: true
                    }
                ]
            }
            const SCREENS = "package:app.screens"
            const DATA = "package:app.data"

            async function showPackages(fixture: { detectChanges: () => void }) {
                TestBed.inject(DependencyMapViewStore).showHierarchy("packages")
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")
            }

            it("should nest the files in their packages once the reader asks for them", async () => {
                // Arrange
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED, openedFolders: [] })

                // Act
                await showPackages(fixture)
                TestBed.inject(DependencyMapViewStore).toggle("package:app")
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toEqual(["/root", "package:app", SCREENS, DATA])
            })

            it("should keep the folders for a map without packages, whatever the reader asked for before", async () => {
                // Arrange
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: DECLARATIONS, openedFolders: [] })

                // Act
                await showPackages(fixture)

                // Assert
                expect(drawnBoxPaths()).toEqual(["/root", "/root/ui", "/root/model"])
            })

            it("should keep the opened file open and the selected file selected across the switch", async () => {
                // Arrange
                const { fixture } = await setup({
                    tree: DECLARING_TREE,
                    declarations: PACKAGED,
                    selectedPath: NODE,
                    openedFolders: [...EVERY_FOLDER, VIEW]
                })

                // Act
                await showPackages(fixture)
                for (const packagePath of ["package:app", SCREENS, DATA]) {
                    TestBed.inject(DependencyMapViewStore).toggle(packagePath)
                }
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toContain(`${VIEW}/View`)
                expect(outlineWidthOf(NODE)).toBe(2.5)
            })

            it("should open the packages around a file revealed from outside the graph", async () => {
                // Arrange
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED, openedFolders: [] })
                await showPackages(fixture)

                // Act
                TestBed.inject(DependencyMapViewStore).reveal(VIEW)
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toContain(VIEW)
            })

            it("should keep the closed package holding a file the search found, and fade the one holding none", async () => {
                // Arrange
                const { fixture } = await setup({
                    tree: DECLARING_TREE,
                    declarations: PACKAGED,
                    openedFolders: [],
                    searchedPaths: new Set([VIEW])
                })
                await showPackages(fixture)
                TestBed.inject(DependencyMapViewStore).toggle("package:app")
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Act
                const opacityOf = (path: string) => {
                    const dataIndex = drawnSeries().data.findIndex(item => item.name === path)
                    return drawnSeries().renderItem({ dataIndex }, { coord: point => point }).children[0].style.opacity
                }

                // Assert
                expect([SCREENS, DATA, "package:app"].map(opacityOf)).toEqual([1, 0.3, 1])
            })

            it("should select a package in the graph alone, explain it in the panel and tell the other views of no node", async () => {
                // Arrange
                const { store, fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED, openedFolders: [] })
                await showPackages(fixture)
                TestBed.inject(DependencyMapViewStore).toggle("package:app")
                fixture.detectChanges()

                // Act
                fireChartEvent("click", boxEvent(SCREENS))
                fireChartEvent("mouseover", boxEvent(SCREENS))
                fireChartEvent("contextmenu", { ...boxEvent(SCREENS), event: { event: { clientX: 5, clientY: 6 } } })
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: null }))
                expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodePath({ value: null }))
                expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: setRightClickedNodeData.type }))
                expect(screen.getByTestId("dependency-panel-badges").textContent).toContain("package")
                expect(outlineWidthOf(SCREENS)).toBe(2.5)
            })

            it("should colour an edge among the packages by its declaration edges, where the folders went by the file edge", async () => {
                // Arrange
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED })
                const strokeOf = (edgeId: string) => {
                    const dataIndex = drawnSeries().data.findIndex(item => (item as { edgeId?: string }).edgeId === edgeId)
                    return drawnSeries()
                        .renderItem({ dataIndex }, { coord: point => point })
                        .children.at(-2).style.stroke
                }
                const amongFolders = strokeOf(`${NODE}|${VIEW}`)

                // Act
                await showPackages(fixture)
                TestBed.inject(DependencyMapViewStore).toggle("package:app")
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(amongFolders).toBe("#dc2626")
                expect(strokeOf(`${DATA}|${SCREENS}`)).toBe("#2563eb")
            })
        })

        it("should mark the file again once another view selects it", async () => {
            // Arrange
            const { store, fixture } = await setup({
                tree: DECLARING_TREE,
                declarations: DECLARATIONS,
                openedFolders: [...EVERY_FOLDER, VIEW]
            })
            fireChartEvent("click", boxEvent(`${VIEW}/View`))

            // Act
            store.overrideSelector(selectedNodePathSelector, NODE)
            store.refreshState()
            fixture.detectChanges()

            // Assert
            expect(outlineWidthOf(NODE)).toBe(2.5)
            expect(outlineWidthOf(`${VIEW}/View`)).toBe(1)
        })
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

    it("should label each level by its own number, and by the levels around it once the reader picks the path", async () => {
        // Arrange
        const { store, fixture } = await setup()
        const numberLabels = drawnLevelLabels()

        // Act
        await changeSettings(store, { levelLabel: "path" })
        fixture.detectChanges()

        // Assert
        expect(numberLabels).toEqual(["level 1", "level 0", "level 0", "level 0"])
        expect(drawnLevelLabels()).toEqual(["level 1", "level 0", "level 1.0", "level 0.0"])
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
