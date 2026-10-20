import { TestBed } from "@angular/core/testing"
import { fireEvent, screen, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { fireChartEvent } from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { DependencyInspectorStore } from "../../stores/dependencyInspector.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import {
    boxEvent,
    CYCLIC,
    DECLARING_TREE,
    drawnBoxPaths,
    MENU_USES_VIEW_UPWARD,
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
            describe("pointing at boxes", () => {
                const pointedAtBoxPaths = () => [...TestBed.inject(DependencyInspectorStore).pointedAtBoxPaths()].sort()
                const lastUsesRow = () =>
                    within(screen.getByRole("region", { name: "Uses" }))
                        .getAllByTestId("dependency-inspector-row")
                        .at(-1)

                it("should point at the boxes of both ends of a row while the pointer rests on it, and at none once it leaves", async () => {
                    // Arrange
                    await setupSelected(VIEW)

                    // Act
                    fireEvent.mouseEnter(lastUsesRow())
                    const whilePointing = pointedAtBoxPaths()
                    fireEvent.mouseLeave(lastUsesRow())

                    // Assert
                    expect(whilePointing).toEqual([NODE, VIEW])
                    expect(pointedAtBoxPaths()).toEqual([])
                })

                it("should point at every box a cycle runs through", async () => {
                    // Arrange
                    await setupSelected(VIEW)
                    const [cycle] = screen.getAllByTestId("dependency-inspector-cycle")

                    // Act
                    fireEvent.mouseEnter(cycle)

                    // Assert
                    expect(pointedAtBoxPaths()).toEqual([NODE, VIEW])
                })

                it("should outline in the graph the box of a file named above a group", async () => {
                    // Arrange
                    const { fixture } = await setupSelected(VIEW)
                    const [file] = screen.getAllByTestId("dependency-inspector-group-file")

                    // Act
                    fireEvent.mouseEnter(file)
                    fireChartEvent("finished")
                    fixture.detectChanges()

                    // Assert
                    expect(pointedAtBoxPaths()).toEqual([NODE])
                    expect(screen.getByTestId("dependency-graph-pointed-at").querySelectorAll("rect")).toHaveLength(1)
                })

                it("should point at no box once the inspector is closed under a resting pointer", async () => {
                    // Arrange
                    await setupSelected(VIEW)
                    fireEvent.mouseEnter(screen.getAllByTestId("dependency-inspector-group-file")[0])

                    // Act
                    await userEvent.click(screen.getByRole("button", { name: "Close inspector" }))

                    // Assert
                    expect(pointedAtBoxPaths()).toEqual([])
                })

                it("should point at no box once another box is selected under a resting pointer", async () => {
                    // Arrange
                    const { store, fixture } = await setupSelected(VIEW)
                    fireEvent.mouseEnter(screen.getAllByTestId("dependency-inspector-group-file")[0])

                    // Act
                    select(store, fixture, NODE)
                    TestBed.tick()

                    // Assert
                    expect(pointedAtBoxPaths()).toEqual([])
                })
            })

            describe("folded sections", () => {
                const openTitles = () =>
                    within(screen.getByTestId("dependency-inspector-body"))
                        .queryAllByRole("button", { expanded: true })
                        .map(header => header.textContent.trim().split(/\s+/)[0])
                        .sort()
                const setupFolded = () => setup({ tree: DECLARING_TREE, declarations: CYCLIC, selectedPath: VIEW, openedSections: [] })
                const openUses = () =>
                    userEvent.click(within(screen.getByRole("region", { name: "Uses" })).getByRole("button", { name: /Uses/ }))

                it("should start with every section closed", async () => {
                    // Arrange & Act
                    await setupFolded()

                    // Assert
                    expect(openTitles()).toEqual([])
                })

                it("should keep a section the reader opened open for the next selection", async () => {
                    // Arrange
                    const { store, fixture } = await setupFolded()
                    await openUses()
                    fixture.detectChanges()

                    // Act
                    select(store, fixture, NODE)

                    // Assert
                    expect(openTitles()).toEqual(["Uses"])
                })

                it("should open the cycles on a click on a cycle badge", async () => {
                    // Arrange
                    Element.prototype.scrollIntoView = jest.fn()
                    const { fixture } = await setupFolded()

                    // Act
                    fireChartEvent("click", { ...boxEvent(VIEW), info: "cycleBadge" })
                    fixture.detectChanges()

                    // Assert
                    expect(openTitles()).toEqual(["Cycles"])
                    expect(screen.getAllByTestId("dependency-inspector-cycle").length).toBeGreaterThan(0)
                })

                it("should open the upward dependencies hidden in a file on a click on its upward badge, and bring them into view", async () => {
                    // Arrange
                    const scrollIntoView = jest.fn()
                    Element.prototype.scrollIntoView = scrollIntoView
                    const declarations = { ...CYCLIC, leafEdges: [...CYCLIC.leafEdges, MENU_USES_VIEW_UPWARD] }
                    const { fixture } = await setup({ tree: DECLARING_TREE, declarations, selectedPath: VIEW, openedSections: [] })

                    // Act
                    fireChartEvent("click", { ...boxEvent(VIEW), info: "upwardBadge" })
                    fixture.detectChanges()

                    // Assert
                    expect(openTitles()).toEqual(["Upward"])
                    expect(screen.getByTestId("dependency-inspector-upward-dependency").textContent).toContain("Menu")
                    expect(scrollIntoView.mock.contexts).toEqual([screen.getByTestId("dependency-inspector-upward")])
                })

                it("should show an upward dependency in the graph: open its file and bring both ends into view", async () => {
                    // Arrange
                    Element.prototype.scrollIntoView = jest.fn()
                    const declarations = { ...CYCLIC, leafEdges: [...CYCLIC.leafEdges, MENU_USES_VIEW_UPWARD] }
                    const { fixture } = await setup({ tree: DECLARING_TREE, declarations, selectedPath: VIEW, openedSections: ["upward"] })

                    // Act
                    const card = screen.getByTestId("dependency-inspector-upward-dependency")
                    await userEvent.click(within(card).getByRole("button", { name: "Show in graph" }))
                    fixture.detectChanges()
                    await screen.findByTestId("dependency-graph")

                    // Assert
                    expect(drawnBoxPaths()).toEqual(expect.arrayContaining([`${VIEW}/Menu`, `${VIEW}/View`]))
                    expect(TestBed.inject(DependencyMapViewStore).viewRequest().paths).toEqual([`${VIEW}/Menu`, `${VIEW}/View`])
                })
            })
        })
    })
})
