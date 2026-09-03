import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { EXPLORER_SELECTION, ExplorerRevealService } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { pathToNodeSelector } from "../../../renderer/renderModel/accumulatedData/pathToNode.selector"
import { ActiveViewStore } from "../../../routing/activeView.store"
import { ViewId } from "../../../routing/routePaths"
import { ViewHandoffStore } from "../../../routing/viewHandoff.store"
import { ShowsHandedOverNodeDirective } from "./showsHandedOverNode.directive"

const HANDED_OVER_NODE = { name: "invoice.ts", path: "/root/src/invoice.ts", id: 3, type: NodeType.FILE, attributes: {} } as CodeMapNode

describe("ShowsHandedOverNodeDirective", () => {
    const selectionMock = {
        select: jest.fn(),
        deselect: jest.fn(),
        isSelected: () => false,
        isHovered: () => false,
        hover: jest.fn(),
        hoverEnd: jest.fn()
    }
    const revealServiceMock = { revealNode: jest.fn() }

    function setup(activeView: ViewId, knownNodes: [string, CodeMapNode][] = [[HANDED_OVER_NODE.path, HANDED_OVER_NODE]]) {
        jest.clearAllMocks()
        TestBed.configureTestingModule({
            providers: [
                ShowsHandedOverNodeDirective,
                provideMockStore({ selectors: [{ selector: pathToNodeSelector, value: new Map(knownNodes) }] }),
                { provide: ActiveViewStore, useValue: { activeView$: of(activeView) } },
                { provide: EXPLORER_SELECTION, useValue: selectionMock },
                { provide: ExplorerRevealService, useValue: revealServiceMock }
            ]
        })
        return TestBed.inject(ViewHandoffStore)
    }

    it("should select and reveal the node another view handed over", () => {
        // Arrange
        const viewHandoffStore = setup("metrics")
        viewHandoffStore.handOverNode("metrics", HANDED_OVER_NODE.path)

        // Act
        TestBed.inject(ShowsHandedOverNodeDirective)

        // Assert
        expect(selectionMock.select).toHaveBeenCalledWith(HANDED_OVER_NODE)
        expect(revealServiceMock.revealNode).toHaveBeenCalledWith(HANDED_OVER_NODE.path)
    })

    it("should show nothing when the handed over node is not on this map", () => {
        // Arrange
        const viewHandoffStore = setup("metrics", [])
        viewHandoffStore.handOverNode("metrics", HANDED_OVER_NODE.path)

        // Act
        TestBed.inject(ShowsHandedOverNodeDirective)

        // Assert
        expect(selectionMock.select).not.toHaveBeenCalled()
        expect(revealServiceMock.revealNode).not.toHaveBeenCalled()
    })

    it("should leave the selection alone when the user arrives without a jump", () => {
        // Arrange
        setup("metrics")

        // Act
        TestBed.inject(ShowsHandedOverNodeDirective)

        // Assert
        expect(selectionMock.select).not.toHaveBeenCalled()
    })
})
