import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { setHoveredNodeId } from "./hoveredNodeId/hoveredNodeId.actions"
import { NodeInteraction } from "./nodeInteraction"
import { setSelectedNodePath } from "./selectedNodePath/selectedNodePath.actions"

describe("NodeInteraction", () => {
    let nodeInteraction: NodeInteraction
    let dispatch: jest.SpyInstance

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideMockStore()] })
        dispatch = jest.spyOn(TestBed.inject(MockStore), "dispatch")
        nodeInteraction = TestBed.inject(NodeInteraction)
    })

    it("should select a node and clear the selection", () => {
        // Act
        nodeInteraction.selectNode("/root/src")
        nodeInteraction.clearSelection()

        // Assert
        expect(dispatch).toHaveBeenNthCalledWith(1, setSelectedNodePath({ value: "/root/src" }))
        expect(dispatch).toHaveBeenNthCalledWith(2, setSelectedNodePath({ value: null }))
    })

    it("should hover a node and clear the hover", () => {
        // Act
        nodeInteraction.hoverNode("/root/src")
        nodeInteraction.clearHover()

        // Assert
        expect(dispatch).toHaveBeenNthCalledWith(1, setHoveredNodeId({ value: "/root/src" }))
        expect(dispatch).toHaveBeenNthCalledWith(2, setHoveredNodeId({ value: null }))
    })
})
