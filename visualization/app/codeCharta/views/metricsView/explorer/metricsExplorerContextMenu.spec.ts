import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { provideMockState } from "../../../mocks/state.mocks"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { rightClickedNodeDataSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { MetricsExplorerContextMenu } from "./metricsExplorerContextMenu"

const NODE_WITH_AREA = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode
const NODE_WITHOUT_AREA = { name: "c.ts", path: "/root/src/c.ts", id: 3, type: NodeType.FILE, attributes: { rloc: 0 } } as CodeMapNode

describe("MetricsExplorerContextMenu", () => {
    it("should enable the menu only for a node with area in the current metric", () => {
        // Arrange
        TestBed.configureTestingModule({
            providers: [
                MetricsExplorerContextMenu,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: rightClickedNodeDataSelector, value: null }
                    ]
                })
            ]
        })
        const contextMenu = TestBed.inject(MetricsExplorerContextMenu)

        // Act & Assert
        expect(contextMenu.isEnabledFor(NODE_WITH_AREA)).toBe(true)
        expect(contextMenu.isEnabledFor(NODE_WITHOUT_AREA)).toBe(false)
    })
})
