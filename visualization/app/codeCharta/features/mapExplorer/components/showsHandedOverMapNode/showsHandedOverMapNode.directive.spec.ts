import { Provider } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { of } from "rxjs"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { pathToNodeSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { ActiveViewStore } from "../../../../routing/activeView.store"
import { ViewId } from "../../../../routing/routePaths"
import { ViewHandoffStore } from "../../../../routing/viewHandoff.store"
import { EXPLORER_SELECTION, ExplorerRevealService } from "../../../sidebarExplorer/facade"
import { HANDED_OVER_MAP_NODE_ARRIVAL } from "../../handedOverMapNodeArrival"
import { MAP_EXPLORER_VIEW } from "../../mapExplorerView"
import { ShowsHandedOverMapNodeDirective } from "./showsHandedOverMapNode.directive"

const HANDED_OVER_NODE = { name: "invoice.ts", path: "/root/src/invoice.ts", id: 3, type: NodeType.FILE, attributes: {} } as CodeMapNode

describe("ShowsHandedOverMapNodeDirective", () => {
    const selectionMock = {
        select: jest.fn(),
        deselect: jest.fn(),
        isSelected: () => false,
        isHovered: () => false,
        hover: jest.fn(),
        hoverEnd: jest.fn()
    }
    const revealServiceMock = { revealNode: jest.fn() }
    const arrivalMock = { receive: jest.fn() }

    function setup(
        view: ViewId,
        knownNodes: [string, CodeMapNode][] = [[HANDED_OVER_NODE.path, HANDED_OVER_NODE]],
        arrivalProviders: Provider[] = []
    ) {
        jest.clearAllMocks()
        TestBed.configureTestingModule({
            providers: [
                ...arrivalProviders,
                ShowsHandedOverMapNodeDirective,
                provideMockStore({ selectors: [{ selector: pathToNodeSelector, value: new Map(knownNodes) }] }),
                { provide: MAP_EXPLORER_VIEW, useValue: view },
                { provide: ActiveViewStore, useValue: { activeView$: of(view) } },
                { provide: EXPLORER_SELECTION, useValue: selectionMock },
                { provide: ExplorerRevealService, useValue: revealServiceMock }
            ]
        })
        return TestBed.inject(ViewHandoffStore)
    }

    it.each<ViewId>(["metrics", "dependencies"])("should select and reveal the node another view handed over to the %s view", view => {
        // Arrange
        const viewHandoffStore = setup(view)
        viewHandoffStore.handOverNode(view, HANDED_OVER_NODE.path)

        // Act
        TestBed.inject(ShowsHandedOverMapNodeDirective)

        // Assert
        expect(selectionMock.select).toHaveBeenCalledWith(HANDED_OVER_NODE)
        expect(revealServiceMock.revealNode).toHaveBeenCalledWith(HANDED_OVER_NODE.path)
    })

    it("should let the view prepare for the handed over node before selecting it", () => {
        // Arrange
        const callOrder: string[] = []
        arrivalMock.receive.mockImplementationOnce(() => callOrder.push("receive"))
        selectionMock.select.mockImplementationOnce(() => callOrder.push("select"))
        const viewHandoffStore = setup("dependencies", undefined, [{ provide: HANDED_OVER_MAP_NODE_ARRIVAL, useValue: arrivalMock }])
        viewHandoffStore.handOverNode("dependencies", HANDED_OVER_NODE.path)

        // Act
        TestBed.inject(ShowsHandedOverMapNodeDirective)

        // Assert
        expect(arrivalMock.receive).toHaveBeenCalledWith(HANDED_OVER_NODE.path)
        expect(callOrder).toEqual(["receive", "select"])
    })

    it("should leave a node handed over to another view for that view", () => {
        // Arrange
        const viewHandoffStore = setup("dependencies")
        viewHandoffStore.handOverNode("metrics", HANDED_OVER_NODE.path)

        // Act
        TestBed.inject(ShowsHandedOverMapNodeDirective)

        // Assert
        expect(selectionMock.select).not.toHaveBeenCalled()
        expect(viewHandoffStore.takeNodeFor("metrics")).toBe(HANDED_OVER_NODE.path)
    })

    it("should show nothing when the handed over node is not on this map", () => {
        // Arrange
        const viewHandoffStore = setup("metrics", [])
        viewHandoffStore.handOverNode("metrics", HANDED_OVER_NODE.path)

        // Act
        TestBed.inject(ShowsHandedOverMapNodeDirective)

        // Assert
        expect(selectionMock.select).not.toHaveBeenCalled()
        expect(revealServiceMock.revealNode).not.toHaveBeenCalled()
    })

    it("should leave the selection alone when the user arrives without a jump", () => {
        // Arrange
        setup("metrics")

        // Act
        TestBed.inject(ShowsHandedOverMapNodeDirective)

        // Assert
        expect(selectionMock.select).not.toHaveBeenCalled()
    })
})
