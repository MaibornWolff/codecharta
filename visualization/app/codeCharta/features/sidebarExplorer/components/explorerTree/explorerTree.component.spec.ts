import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapNode, NodeType } from "../../../../model/codeCharta.model"
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
    const configureWithTree = (rootNode: CodeMapNode | undefined) => {
        TestBed.configureTestingModule({
            imports: [ExplorerTreeComponent],
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                ...provideExplorerPortsMock({ tree: { rootNodeFor: () => of(rootNode) } })
            ]
        })
    }

    it("should render the root node the view's tree port supplies", async () => {
        // Arrange
        configureWithTree(TEST_NODE)

        // Act
        const { container } = await render(ExplorerTreeComponent)

        // Assert
        expect(container.querySelector("#metrics\\:\\/root")).toBeTruthy()
    })

    it("should render nothing when the view's tree port has no root node", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithTree(undefined)

        // Act
        const { container } = await render(ExplorerTreeComponent)

        // Assert
        expect(container.querySelectorAll("cc-explorer-tree-level").length).toBe(0)
    })
})
