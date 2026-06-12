import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { AppStatusStore } from "./appStatus.store"
import { hoveredNodeIdSelector } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { rightClickedNodeDataSelector } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.selector"
import { selectedBuildingIdSelector } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector"
import { setHoveredNodeId } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { setRightClickedNodeData } from "../../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

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
            mockStore.overrideSelector(hoveredNodeIdSelector, 42)
            mockStore.refreshState()

            // Act & Assert
            store.hoveredNodeId$.subscribe(value => {
                expect(value).toBe(42)
                done()
            })
        })
    })

    describe("rightClickedNodeData$", () => {
        it("should emit value from selector", done => {
            // Arrange
            const data = { nodeId: 7, xPositionOfRightClickEvent: 1, yPositionOfRightClickEvent: 2, origin: "explorer" as const }
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
            mockStore.overrideSelector(selectedBuildingIdSelector, 99)
            mockStore.refreshState()

            // Act & Assert
            store.selectedBuildingId$.subscribe(value => {
                expect(value).toBe(99)
                done()
            })
        })
    })

    describe("setHoveredNodeId", () => {
        it("should dispatch setHoveredNodeId action with value", async () => {
            // Arrange & Act
            store.setHoveredNodeId(13)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setHoveredNodeId({ value: 13 }))
        })
    })

    describe("setRightClickedNodeData", () => {
        it("should dispatch setRightClickedNodeData action with value", async () => {
            // Arrange
            const data = { nodeId: 5, xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin: "explorer" as const }

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
