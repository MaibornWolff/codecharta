import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapNode, NodeType } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapMouseEventService } from "../../../../ui/codeMap/codeMap.mouseEvent.service"
import { ThreeRendererService } from "../../../../ui/codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../../../ui/codeMap/threeViewer/threeSceneService"
import { explorerTreeNodeSelector } from "../../selectors/explorerTreeNode.selector"
import { explorerCountsSelector } from "../../selectors/sidebarExplorer.selectors"
import { SidebarExplorerComponent } from "./sidebarExplorer.component"

const ROOT: CodeMapNode = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 0 },
    children: []
}

describe("SidebarExplorerComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SidebarExplorerComponent],
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: explorerTreeNodeSelector, value: ROOT },
                        { selector: explorerCountsSelector, value: { shown: 0, flattened: 0, hidden: 0, noArea: 0 } }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeSceneService, useValue: { selectBuilding: jest.fn(), clearConstantHighlight: jest.fn() } },
                { provide: IdToBuildingService, useValue: { get: jest.fn(), has: jest.fn(), buildingIds$: of(new Set<number>()) } },
                { provide: ThreeRendererService, useValue: { render: jest.fn() } },
                {
                    provide: CodeMapMouseEventService,
                    useValue: { drawLabelSelectedBuilding: jest.fn(), hoverNode: jest.fn(), unhoverNode: jest.fn() }
                }
            ]
        })
    })

    it("should compose header, search bar, sort control and tree", async () => {
        // Arrange & Act
        const { container } = await render(SidebarExplorerComponent)

        // Assert
        expect(container.querySelector("cc-explorer-header")).not.toBe(null)
        expect(container.querySelector("cc-explorer-search-bar")).not.toBe(null)
        expect(container.querySelector("cc-explorer-sort-control")).not.toBe(null)
        expect(container.querySelector("cc-explorer-tree")).not.toBe(null)
    })
})
