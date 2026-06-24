import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapNode, NodeType } from "../../../../codeCharta.model"
import { IdToBuildingService } from "../../../../services/idToBuilding/idToBuilding.service"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapMouseEventService } from "../../../../features/codeMap/facade"
import { ThreeRendererService } from "../../../../features/codeMap/facade"
import { ThreeSceneService } from "../../../../features/codeMap/facade"
import { explorerTreeNodeSelector } from "../../selectors/explorerTreeNode.selector"
import { ExplorerTreeComponent } from "./explorerTree.component"

const TEST_NODE: CodeMapNode = {
    name: "root",
    path: "/root",
    type: NodeType.FOLDER,
    attributes: { unary: 0 },
    children: []
}

describe("ExplorerTreeComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExplorerTreeComponent],
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: explorerTreeNodeSelector, value: TEST_NODE }]
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

    it("should render a single root tree level when root node is provided", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerTreeComponent)

        // Assert
        expect(container.querySelectorAll("cc-explorer-tree-level").length).toBeGreaterThanOrEqual(1)
    })
})
