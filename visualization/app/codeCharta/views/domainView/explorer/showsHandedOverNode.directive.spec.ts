import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { ExplorerRevealService } from "../../../features/sidebarExplorer/facade"
import { ActiveViewStore } from "../../../routing/activeView.store"
import { ViewId } from "../../../routing/routePaths"
import { ViewHandoffStore } from "../../../routing/viewHandoff.store"
import { DomainSelectionStore } from "../stores/domainSelection.store"
import { ShowsHandedOverNodeDirective } from "./showsHandedOverNode.directive"

const HANDED_OVER_NODE_PATH = "/root/src/invoice.ts"

describe("ShowsHandedOverNodeDirective", () => {
    const revealServiceMock = { revealNode: jest.fn() }

    function setup(activeView: ViewId) {
        jest.clearAllMocks()
        TestBed.configureTestingModule({
            providers: [
                ShowsHandedOverNodeDirective,
                { provide: ActiveViewStore, useValue: { activeView$: of(activeView) } },
                { provide: ExplorerRevealService, useValue: revealServiceMock }
            ]
        })
        return { viewHandoffStore: TestBed.inject(ViewHandoffStore), domainSelectionStore: TestBed.inject(DomainSelectionStore) }
    }

    it("should select and reveal the node another view handed over", () => {
        // Arrange
        const { viewHandoffStore, domainSelectionStore } = setup("domain")
        viewHandoffStore.handOverNode("domain", HANDED_OVER_NODE_PATH)

        // Act
        TestBed.inject(ShowsHandedOverNodeDirective)

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBe(HANDED_OVER_NODE_PATH)
        expect(revealServiceMock.revealNode).toHaveBeenCalledWith(HANDED_OVER_NODE_PATH)
    })

    it("should leave the selection alone when the user arrives without a jump", () => {
        // Arrange
        const { domainSelectionStore } = setup("domain")

        // Act
        TestBed.inject(ShowsHandedOverNodeDirective)

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBeNull()
        expect(revealServiceMock.revealNode).not.toHaveBeenCalled()
    })

    it("should keep the node handed over until its own view is arrived at", () => {
        // Arrange
        const { viewHandoffStore, domainSelectionStore } = setup("metrics")
        viewHandoffStore.handOverNode("domain", HANDED_OVER_NODE_PATH)

        // Act
        TestBed.inject(ShowsHandedOverNodeDirective)

        // Assert
        expect(domainSelectionStore.selectedNodePath()).toBeNull()
        expect(viewHandoffStore.takeNodeFor("domain")).toBe(HANDED_OVER_NODE_PATH)
    })
})
