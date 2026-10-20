import { TestBed } from "@angular/core/testing"
import { MockStore } from "@ngrx/store/testing"
import { screen } from "@testing-library/angular"
import { DependencyDeclarations } from "../../../../lenses/dependency/dependencyLens.facade"
import { fireChartEvent } from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { setHoveredNodePath, setRightClickedNodeData, setSelectedNodePath } from "../../../../stores/sharedView/sharedView.write.facade"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import {
    boxEvent,
    changeSettings,
    clickBox,
    DECLARATIONS,
    DECLARING_TREE,
    drawnBoxPaths,
    drawnSeries,
    EVERY_FOLDER,
    NODE,
    outlineWidthOf,
    setup,
    stubTheGraphChart,
    VIEW
} from "./dependencyMap.component.mocks"

jest.mock("echarts/core", () => jest.requireActual("../../../../renderer/dependencyGraph/testing/dependencyGraph.stub").echartsCoreStub)

describe("DependencyMapComponent", () => {
    stubTheGraphChart()

    describe("with declarations", () => {
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
                await changeSettings(TestBed.inject(MockStore), { hierarchy: "packages" })
                fixture.detectChanges()
            }

            it("should nest the files in their packages once the reader asks for them", async () => {
                // Arrange
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED, openedBoxes: [] })

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
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: DECLARATIONS, openedBoxes: [] })

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
                    openedBoxes: [...EVERY_FOLDER, VIEW]
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
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED, openedBoxes: [] })
                await showPackages(fixture)

                // Act
                TestBed.inject(DependencyMapViewStore).reveal([VIEW])
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
                    openedBoxes: [],
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

            it("should head a file in the inspector with the package it is drawn in", async () => {
                // Arrange
                const { fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED, selectedPath: VIEW })

                // Act
                await showPackages(fixture)
                fixture.detectChanges()

                // Assert
                expect(screen.getByTestId("dependency-inspector-parent").textContent.trim()).toBe("package screens")
            })

            it("should select a package in the graph alone, explain it in the inspector and tell the other views of no node", async () => {
                // Arrange
                const { store, fixture } = await setup({ tree: DECLARING_TREE, declarations: PACKAGED, openedBoxes: [] })
                await showPackages(fixture)
                TestBed.inject(DependencyMapViewStore).toggle("package:app")
                fixture.detectChanges()

                // Act
                clickBox(boxEvent(SCREENS))
                fireChartEvent("mouseover", boxEvent(SCREENS))
                fireChartEvent("contextmenu", { ...boxEvent(SCREENS), event: { event: { clientX: 5, clientY: 6 } } })
                fixture.detectChanges()
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(store.dispatch).toHaveBeenCalledWith(setSelectedNodePath({ value: null }))
                expect(store.dispatch).toHaveBeenCalledWith(setHoveredNodePath({ value: null }))
                expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: setRightClickedNodeData.type }))
                expect(screen.getByTestId("dependency-inspector-badges").textContent).toContain("package")
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
    })
})
