import { screen } from "@testing-library/angular"
import { DependencyDeclarations } from "../../../../lenses/dependency/dependencyLens.facade"
import { fireChartEvent } from "../../../../renderer/dependencyGraph/testing/dependencyGraph.stub"
import { edgeMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { selectedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { setHoveredNodePath, setRightClickedNodeData, setSelectedNodePath } from "../../../../stores/sharedView/sharedView.write.facade"
import {
    boxEvent,
    CYCLIC,
    changeSettings,
    clickBox,
    DECLARATIONS,
    DECLARING_TREE,
    doubleClickBox,
    drawnBoxPaths,
    drawnEdgeIndices,
    drawnSeries,
    EVERY_FOLDER,
    MENU_USES_VIEW_UPWARD,
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

        it("should open and close a file on a double click each", async () => {
            // Arrange
            await setup({ tree: DECLARING_TREE, declarations: DECLARATIONS })

            // Act
            doubleClickBox(VIEW)
            await screen.findByTestId("dependency-graph")
            const opened = drawnBoxPaths()
            doubleClickBox(VIEW)
            await screen.findByTestId("dependency-graph")

            // Assert
            expect(opened).toContain(`${VIEW}/View`)
            expect(drawnBoxPaths()).not.toContain(`${VIEW}/View`)
        })

        it("should tell the other views the file of a selected, hovered or right-clicked declaration, and mark the declaration itself", async () => {
            // Arrange
            const { store, fixture } = await setup({
                tree: DECLARING_TREE,
                declarations: DECLARATIONS,
                openedBoxes: [...EVERY_FOLDER, VIEW]
            })
            const declaration = boxEvent(`${VIEW}/View`)

            // Act
            clickBox(declaration)
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

        describe("badges", () => {
            const badgeCountOf = (path: string, badgeInfo = "cycleBadge") => {
                const { data, renderItem } = drawnSeries()
                const parts = data
                    .flatMap((item, dataIndex) => (item.name === path || item.titledBoxPath === path ? [dataIndex] : []))
                    .flatMap(dataIndex => renderItem({ dataIndex }, { coord: point => point }).children) as unknown as {
                    info?: string
                    style: { text?: string }
                }[]
                const badge = parts.filter(part => part.info === badgeInfo)
                return badge.length === 0 ? null : (badge.find(part => part.style.text)?.style.text ?? "1")
            }

            it("should count on each file the cycle between the two files, also once a file is opened", async () => {
                // Arrange
                await setup({ tree: DECLARING_TREE, declarations: CYCLIC })
                const whileClosed = [VIEW, NODE].map(path => badgeCountOf(path))

                // Act
                doubleClickBox(VIEW)
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(whileClosed).toEqual(["1", "1"])
                expect([VIEW, NODE].map(path => badgeCountOf(path))).toEqual(["1", "1"])
            })

            it("should draw no badge once the reader switches them off, or for another edge metric", async () => {
                // Arrange
                const { store, fixture } = await setup({ tree: DECLARING_TREE, declarations: CYCLIC })

                // Act
                await changeSettings(store, { shownBoxBadges: ["upward"] })
                fixture.detectChanges()
                const switchedOff = badgeCountOf(VIEW)
                await changeSettings(store, { shownBoxBadges: ["betweenFiles", "insideFiles"] })
                store.overrideSelector(edgeMetricSelector, "temporal_coupling")
                store.refreshState()
                fixture.detectChanges()

                // Assert
                expect(switchedOff).toBeNull()
                expect(badgeCountOf(VIEW)).toBeNull()
            })

            it("should count on a closed file the upward dependency between its declarations, and none once it is opened or switched off", async () => {
                // Arrange
                const upward: DependencyDeclarations = { ...DECLARATIONS, leafEdges: [...DECLARATIONS.leafEdges, MENU_USES_VIEW_UPWARD] }
                const { store, fixture } = await setup({ tree: DECLARING_TREE, declarations: upward })
                const whileClosed = badgeCountOf(VIEW, "upwardBadge")

                // Act
                await changeSettings(store, { shownBoxBadges: ["betweenFiles", "insideFiles", "declaration"] })
                fixture.detectChanges()
                const switchedOff = badgeCountOf(VIEW, "upwardBadge")
                await changeSettings(store, { shownBoxBadges: ["upward"] })
                fixture.detectChanges()
                doubleClickBox(VIEW)
                await screen.findByTestId("dependency-graph")

                // Assert
                expect(whileClosed).toBe("1")
                expect(switchedOff).toBeNull()
                expect(badgeCountOf(VIEW, "upwardBadge")).toBeNull()
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

        it("should mark the file again once another view selects it", async () => {
            // Arrange
            const { store, fixture } = await setup({
                tree: DECLARING_TREE,
                declarations: DECLARATIONS,
                openedBoxes: [...EVERY_FOLDER, VIEW]
            })
            clickBox(boxEvent(`${VIEW}/View`))

            // Act
            store.overrideSelector(selectedNodePathSelector, NODE)
            store.refreshState()
            fixture.detectChanges()

            // Assert
            expect(outlineWidthOf(NODE)).toBe(2.5)
            expect(outlineWidthOf(`${VIEW}/View`)).toBe(1)
        })
    })
})
