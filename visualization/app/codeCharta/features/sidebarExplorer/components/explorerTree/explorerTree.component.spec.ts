import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/renderModel.facade"
import { areaMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { provideExplorerPortsMock } from "../../explorerPorts.mocks"
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
                    selectors: [
                        { selector: accumulatedDataSelector, value: { unifiedMapNode: TEST_NODE } },
                        { selector: areaMetricSelector, value: "rloc" }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                ...provideExplorerPortsMock()
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
