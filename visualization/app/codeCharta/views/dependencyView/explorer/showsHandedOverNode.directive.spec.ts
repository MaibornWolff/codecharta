import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { EXPLORER_SELECTION, ExplorerRevealService } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { pathToNodeSelector } from "../../../renderer/renderModel/accumulatedData/pathToNode.selector"
import { ActiveViewStore } from "../../../routing/activeView.store"
import { ViewHandoffStore } from "../../../routing/viewHandoff.store"
import { ShowsHandedOverNodeDirective } from "./showsHandedOverNode.directive"

const HANDED_OVER_NODE = { name: "invoice.ts", path: "/root/src/invoice.ts", id: 3, type: NodeType.FILE, attributes: {} } as CodeMapNode

describe("ShowsHandedOverNodeDirective of the dependency view", () => {
    it("should select and reveal the node the Metric view handed over", () => {
        // Arrange
        const selection = { select: jest.fn() }
        const revealService = { revealNode: jest.fn() }
        TestBed.configureTestingModule({
            providers: [
                ShowsHandedOverNodeDirective,
                provideMockStore({
                    selectors: [{ selector: pathToNodeSelector, value: new Map([[HANDED_OVER_NODE.path, HANDED_OVER_NODE]]) }]
                }),
                { provide: ActiveViewStore, useValue: { activeView$: of("dependencies") } },
                { provide: EXPLORER_SELECTION, useValue: selection },
                { provide: ExplorerRevealService, useValue: revealService }
            ]
        })
        TestBed.inject(ViewHandoffStore).handOverNode("dependencies", HANDED_OVER_NODE.path)

        // Act
        TestBed.inject(ShowsHandedOverNodeDirective)

        // Assert
        expect(selection.select).toHaveBeenCalledWith(HANDED_OVER_NODE)
        expect(revealService.revealNode).toHaveBeenCalledWith(HANDED_OVER_NODE.path)
    })
})
