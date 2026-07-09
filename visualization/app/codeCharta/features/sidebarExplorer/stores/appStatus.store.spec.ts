import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { setHoveredNodeId, setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"
import { hoveredNodeIdSelector } from "../../../stores/sharedView/store/hoveredNodeId/hoveredNodeId.selector"
import { rightClickedNodeDataSelector } from "../../../stores/sharedView/store/rightClickedNodeData/rightClickedNodeData.selector"
import { selectedBuildingIdSelector } from "../../../stores/sharedView/store/selectedBuildingId/selectedBuildingId.selector"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { AppStatusStore } from "./appStatus.store"

describe("AppStatusStore", () => {
    let store: AppStatusStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AppStatusStore,
                provideMockStore({
                    selectors: [
                        { selector: hoveredNodeIdSelector, value: null },
                        { selector: rightClickedNodeDataSelector, value: null },
                        { selector: selectedBuildingIdSelector, value: null }
                    ]
                })
            ]
        })

        store = TestBed.inject(AppStatusStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("hoveredNodeId$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(hoveredNodeIdSelector, "/root/File.ts")
            mockStore.refreshState()

            // Act & Assert
            store.hoveredNodeId$.subscribe(value => {
                expect(value).toBe("/root/File.ts")
                done()
            })
        })
    })

    describe("rightClickedNodeData$", () => {
        it("should emit value from selector", done => {
            // Arrange
            const data = {
                nodeId: "/root/File.ts",
                xPositionOfRightClickEvent: 1,
                yPositionOfRightClickEvent: 2,
                origin: "explorer" as const
            }
            mockStore.overrideSelector(rightClickedNodeDataSelector, data)
            mockStore.refreshState()

            // Act & Assert
            store.rightClickedNodeData$.subscribe(value => {
                expect(value).toEqual(data)
                done()
            })
        })
    })

    describe("selectedBuildingId$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(selectedBuildingIdSelector, "/root/File.ts")
            mockStore.refreshState()

            // Act & Assert
            store.selectedBuildingId$.subscribe(value => {
                expect(value).toBe("/root/File.ts")
                done()
            })
        })
    })

    describe("setHoveredNodeId", () => {
        it("should dispatch setHoveredNodeId action with value", async () => {
            // Arrange & Act
            store.setHoveredNodeId("/root/File.ts")

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setHoveredNodeId({ value: "/root/File.ts" }))
        })
    })

    describe("setRightClickedNodeData", () => {
        it("should dispatch setRightClickedNodeData action with value", async () => {
            // Arrange
            const data = {
                nodeId: "/root/File.ts",
                xPositionOfRightClickEvent: 10,
                yPositionOfRightClickEvent: 20,
                origin: "explorer" as const
            }

            // Act
            store.setRightClickedNodeData(data)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setRightClickedNodeData({ value: data }))
        })

        it("should dispatch setRightClickedNodeData action with null", async () => {
            // Arrange & Act
            store.setRightClickedNodeData(null)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setRightClickedNodeData({ value: null }))
        })
    })
})
