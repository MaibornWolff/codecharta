import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { NodeInteraction, setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"
import { DependencyMapWriteStore } from "./dependencyMap.write.store"

describe("DependencyMapWriteStore", () => {
    let writeStore: DependencyMapWriteStore
    let nodeInteraction: { selectNode: jest.Mock; hoverNode: jest.Mock }
    let dispatchSpy: jest.SpyInstance

    beforeEach(() => {
        nodeInteraction = { selectNode: jest.fn(), hoverNode: jest.fn() }
        TestBed.configureTestingModule({ providers: [provideMockStore(), { provide: NodeInteraction, useValue: nodeInteraction }] })
        dispatchSpy = jest.spyOn(TestBed.inject(MockStore), "dispatch")
        writeStore = TestBed.inject(DependencyMapWriteStore)
    })

    it("should select and hover through the shared node interaction", () => {
        // Act
        writeStore.selectNode("/root/a.ts")
        writeStore.hoverNode(null)

        // Assert
        expect(nodeInteraction.selectNode).toHaveBeenCalledWith("/root/a.ts")
        expect(nodeInteraction.hoverNode).toHaveBeenCalledWith(null)
    })

    it("should open the node context menu at the pointer, naming the dependency map as its origin", () => {
        // Act
        writeStore.openContextMenu("/root/a.ts", 10, 20)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: { nodeId: "/root/a.ts", xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin: "dependencyMap" }
            })
        )
    })
})
