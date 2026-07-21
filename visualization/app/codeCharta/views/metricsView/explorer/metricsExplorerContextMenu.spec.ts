import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { rightClickedNodeDataSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setRightClickedNodeData } from "../../../stores/sharedView/sharedView.write.facade"
import { MetricsExplorerContextMenu } from "./metricsExplorerContextMenu"

const NODE_WITH_AREA = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode
const NODE_WITHOUT_AREA = { name: "c.ts", path: "/root/src/c.ts", id: 3, type: NodeType.FILE, attributes: { rloc: 0 } } as CodeMapNode

describe("MetricsExplorerContextMenu", () => {
    function setup(rightClickedNodeData: unknown = null) {
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerContextMenu,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: rightClickedNodeDataSelector, value: rightClickedNodeData }
                    ]
                })
            ]
        })
        return TestBed.inject(MetricsExplorerContextMenu)
    }

    it("should enable the menu only for a node with area in the current metric", () => {
        // Arrange & Act & Assert
        const contextMenu = setup()
        expect(contextMenu.isEnabledFor(NODE_WITH_AREA)).toBe(true)
        expect(contextMenu.isEnabledFor(NODE_WITHOUT_AREA)).toBe(false)
    })

    it("should mark the node the open menu is anchored to", () => {
        // Arrange & Act
        const contextMenu = setup({ nodeId: NODE_WITH_AREA.path })

        // Assert
        expect(contextMenu.isMarked(NODE_WITH_AREA)).toBe(true)
        expect(contextMenu.isMarked(NODE_WITHOUT_AREA)).toBe(false)
    })

    it("should publish the right-clicked node data on open, from the explorer", () => {
        // Arrange
        const contextMenu = setup()
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        contextMenu.open(NODE_WITH_AREA, 10, 20)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(
            setRightClickedNodeData({
                value: { nodeId: NODE_WITH_AREA.path, xPositionOfRightClickEvent: 10, yPositionOfRightClickEvent: 20, origin: "explorer" }
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
