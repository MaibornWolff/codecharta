import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { setHoveredNodePath } from "./hoveredNodePath/hoveredNodePath.actions"
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
        nodeInteraction.hoverNode(null)

        // Assert
        expect(dispatch).toHaveBeenNthCalledWith(1, setHoveredNodePath({ value: "/root/src" }))
        expect(dispatch).toHaveBeenNthCalledWith(2, setHoveredNodePath({ value: null }))
    })
})
