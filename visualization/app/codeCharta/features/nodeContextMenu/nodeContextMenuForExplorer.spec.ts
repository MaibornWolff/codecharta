import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { provideMockState } from "../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../model/codeCharta.model"
import { rightClickedNodeDataSelector } from "../../stores/sharedView/sharedView.read.facade"
import { setRightClickedNodeData } from "../../stores/sharedView/sharedView.write.facade"
import { NodeContextMenuForExplorer } from "./nodeContextMenuForExplorer"

const NODE = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: {} } as CodeMapNode
const OTHER_NODE = { name: "b.ts", path: "/root/src/b.ts", id: 3, type: NodeType.FILE, attributes: {} } as CodeMapNode

describe("NodeContextMenuForExplorer", () => {
    function setup(rightClickedNodeData: unknown = null) {
        TestBed.configureTestingModule({
            providers: [
                NodeContextMenuForExplorer,
                provideMockState(),
                provideMockStore({ selectors: [{ selector: rightClickedNodeDataSelector, value: rightClickedNodeData }] })
            ]
        })
        return TestBed.inject(NodeContextMenuForExplorer)
    }

    it("should offer the menu on every row", () => {
        // Arrange
        const contextMenu = setup()

        // Act & Assert
        expect(contextMenu.isEnabledFor(NODE.path)).toBe(true)
    })

    it("should mark the node the open menu is anchored to", () => {
        // Arrange & Act
        const contextMenu = setup({ nodeId: NODE.path })

        // Assert
        expect(contextMenu.isMarked(NODE.path)).toBe(true)
        expect(contextMenu.isMarked(OTHER_NODE.path)).toBe(false)
    })

    it("should publish the right-clicked node data on open, from the explorer", () => {
        // Arrange
        const contextMenu = setup()
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        contextMenu.open(NODE.path, 10, 20)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: { nodeId: NODE.path, xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin: "explorer" }
            })
        )
    })

    it("should clear the right-clicked node data on close", () => {
        // Arrange
        const contextMenu = setup()
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        contextMenu.close()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRightClickedNodeData({ value: null }))
    })
})
