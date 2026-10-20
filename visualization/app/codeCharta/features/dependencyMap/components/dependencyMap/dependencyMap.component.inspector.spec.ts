import { TestBed } from "@angular/core/testing"
import { fireEvent, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DependencyDeclarations } from "../../../../lenses/dependency/dependencyLens.facade"
import { fireChartEvent } from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"
import { setSelectedNodePath } from "../../../../stores/sharedView/sharedView.write.facade"
import { DependencyInspectorStore } from "../../stores/dependencyInspector.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import {
    boxEvent,
    CYCLIC,
    clickBox,
    DECLARING_TREE,
    drawnBoxPaths,
    drawnSeries,
    leveledFolder,
    loadOtherFiles,
    NO_DECLARATIONS,
    NODE,
    select,
    setup,
    setupSelected,
    stubTheGraphChart,
    VIEW
} from "./dependencyMap.component.mocks"

jest.mock("echarts/core", () => jest.requireActual("../../../../renderer/dependencyGraph/testing/dependencyGraph.stub").echartsCoreStub)

describe("DependencyMapComponent", () => {
    stubTheGraphChart()

    describe("with declarations", () => {
        describe("inspector", () => {
            const EDGE_ID = `${VIEW}|${NODE}`

            const inspectorTitle = () => screen.queryByTestId("dependency-inspector-title")?.textContent.trim() ?? null
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
                const withoutSelection = inspectorTitle()

                // Act
                select(store, fixture, VIEW)

                // Assert
                expect(withoutSelection).toBeNull()
                expect(inspectorTitle()).toBe("view.ts")
                expect(screen.getByRole("region", { name: "Declarations" }).textContent).toContain("Menu")
            })

            it("should say that it is shown only while it explains a selection outside compare mode", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(null)
                const isShown = TestBed.inject(DependencyInspectorStore).isShown
                const withoutSelection = isShown()

                // Act
                select(store, fixture, VIEW)
                const withSelection = isShown()
                store.overrideSelector(isDeltaStateSelector, true)
                store.refreshState()
                fixture.detectChanges()

                // Assert
                expect([withoutSelection, withSelection, isShown()]).toEqual([false, true, false])
            })

            it("should slide in over the right edge of the graph once it has something to explain", async () => {
                // Arrange
                const { store, fixture, container } = await setupSelected(null)
                const inspector = container.querySelector("cc-dependency-inspector")
                const isSlidOut = () => inspector.classList.contains("translate-x-full")
                const whileClosed = isSlidOut()

                // Act
                select(store, fixture, VIEW)

                // Assert
                expect([whileClosed, isSlidOut()]).toEqual([true, false])
            })

            it("should stay away for a map that tells no declarations", async () => {
                // Arrange
                const selectedInAMapWithoutDeclarations = { selectedPath: "/root/ui/view.ts" }

                // Act
                await setup(selectedInAMapWithoutDeclarations)

                // Assert
                expect(inspectorTitle()).toBeNull()
            })

            it("should explain a clicked edge, clear the selection of the other views and mark the edge", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)

                // Act
                fireChartEvent("click", { seriesId: "graph", data: { isEdge: true, edgeId: EDGE_ID } })
                select(store, fixture, null)

                // Assert
                expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: null }))
                expect(inspectorTitle()).toBe("view.ts → node.ts")
                const edgeIndex = drawnSeries().data.findIndex(item => (item as { edgeId?: string }).edgeId === EDGE_ID)
                expect(drawnSeries().renderItem({ dataIndex: edgeIndex }, { coord: point => point }).children).toHaveLength(3)
            })

            it("should unfold the selected edge into the declarations at its ends", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                fireChartEvent("click", { seriesId: "graph", data: { isEdge: true, edgeId: EDGE_ID } })
                select(store, fixture, null)

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Unfold in graph" }))
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toEqual(expect.arrayContaining([`${VIEW}/View`, `${NODE}/Node`]))
                expect(inspectorTitle()).toBeNull()
            })

            it("should open and close the selected file from the inspector", async () => {
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

            it("should go to a declaration named in the inspector: open its file, select it and tell the other views its file", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                const usedDeclaration = within(screen.getByRole("region", { name: "Uses" })).getByRole("button", { name: "Node" })

                // Act
                await userEvent.click(usedDeclaration)
                select(store, fixture, NODE)

                // Assert
                expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: NODE }))
                expect(drawnBoxPaths()).toContain(`${NODE}/Node`)
                expect(TestBed.inject(DependencyMapViewStore).viewRequest().paths).toEqual([`${NODE}/Node`])
                expect(inspectorTitle()).toBe("Node")
                expect(screen.getByTestId("dependency-inspector-badges").textContent).toContain("Class")
            })

            it("should light up the edge of the row under the pointer and let the others step back", async () => {
                // Arrange
                const { fixture } = await setupSelected(VIEW)
                const usesRow = within(screen.getByRole("region", { name: "Uses" }))
                    .getAllByTestId("dependency-inspector-row")
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
                const [cycle] = screen.getAllByTestId("dependency-inspector-cycle")

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
                const afterClosing = inspectorTitle()
                clickBox(boxEvent(NODE))
                select(store, fixture, NODE)

                // Assert
                expect(afterClosing).toBeNull()
                expect(inspectorTitle()).toBe("node.ts")
            })

            it("should forget a selected declaration once other files are loaded", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                TestBed.inject(DependencyMapViewStore).toggle(VIEW)
                fixture.detectChanges()
                clickBox(boxEvent(`${VIEW}/Menu`))
                fixture.detectChanges()
                const whileSelected = inspectorTitle()

                // Act
                await loadOtherFiles(store, DECLARING_TREE)
                fixture.detectChanges()

                // Assert
                expect(whileSelected).toBe("Menu")
                expect(inspectorTitle()).toBe("view.ts")
            })

            it("should tell only of what the graph draws, leaving out the declarations of a file outside the focus", async () => {
                // Arrange
                const focusedOnUi = leveledFolder("/root/ui", DECLARING_TREE.children[0].children, 1)

                // Act
                await setup({ tree: focusedOnUi, declarations: CYCLIC, selectedPath: VIEW, openedBoxes: [] })

                // Assert
                expect(screen.getByRole("region", { name: "Uses" }).textContent).not.toContain("Node")
                expect(screen.queryByRole("region", { name: "Used by" })).toBeNull()
                expect(screen.queryByRole("region", { name: "Cycles" })).toBeNull()
            })

            it("should not bring the cycles into view again for a box selected after the inspector was closed", async () => {
                // Arrange
                const scrollIntoView = jest.fn()
                Element.prototype.scrollIntoView = scrollIntoView
                const { store, fixture } = await setupSelected(VIEW)
                fireChartEvent("click", { ...boxEvent(VIEW), info: "cycleBadge" })
                fixture.detectChanges()

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Close inspector" }))
                fixture.detectChanges()
                clickBox(boxEvent(NODE))
                select(store, fixture, NODE)

                // Assert
                expect(inspectorTitle()).toBe("node.ts")
                expect(scrollIntoView).toHaveBeenCalledTimes(1)
            })

            it("should forget the selected edge once another view selects a node, also after that node is deselected", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                fireChartEvent("click", { seriesId: "graph", data: { isEdge: true, edgeId: EDGE_ID } })
                select(store, fixture, null)

                // Act
                select(store, fixture, NODE)
                select(store, fixture, null)

                // Assert
                expect(inspectorTitle()).toBeNull()
            })

            it("should explain a subject again that another view selects after the inspector was closed on it", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                await userEvent.click(screen.getByRole("button", { name: "Close inspector" }))
                fixture.detectChanges()

                // Act
                select(store, fixture, NODE)
                select(store, fixture, VIEW)

                // Assert
                expect(inspectorTitle()).toBe("view.ts")
            })

            it("should open the folders around a hidden file when the inspector opens that file in the graph", async () => {
                // Arrange
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: CYCLIC, selectedPath: VIEW, openedBoxes: [] })

                // Act
                await userEvent.click(screen.getByRole("button", { name: "Open in graph" }))
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(drawnBoxPaths()).toContain(`${VIEW}/Menu`)
                expect(TestBed.inject(DependencyMapViewStore).viewRequest().paths).toEqual([VIEW])
            })

            it("should stop lighting up a row's edge once the reader goes to a declaration named in that row", async () => {
                // Arrange
                const { store, fixture } = await setupSelected(VIEW)
                const usesRow = within(screen.getByRole("region", { name: "Uses" }))
                    .getAllByTestId("dependency-inspector-row")
                    .at(-1)
                fireEvent.mouseEnter(usesRow)

                // Act
                await userEvent.click(within(usesRow).getByRole("button", { name: "Node" }))
                select(store, fixture, NODE)
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(new Set(Object.values(edgeOpacities()))).toEqual(new Set([1]))
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
    })
})
