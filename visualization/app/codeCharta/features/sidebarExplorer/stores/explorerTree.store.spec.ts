import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { explorerTreeNodeSelector } from "../selectors/explorerTreeNode.selector"
import { ExplorerTreeStore } from "./explorerTree.store"

describe("ExplorerTreeStore", () => {
    let store: ExplorerTreeStore
    let mockStore: MockStore

    const rootNode: CodeMapNode = {
        name: "root",
        path: "/root",
        type: NodeType.FOLDER,
        attributes: {},
        children: []
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ExplorerTreeStore, provideMockStore({ selectors: [{ selector: explorerTreeNodeSelector, value: rootNode }] })]
        })

        store = TestBed.inject(ExplorerTreeStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("rootNode$", () => {
        it("should emit value from selector", done => {
            // Arrange
            const updatedRoot: CodeMapNode = {
                name: "another-root",
                path: "/another-root",
                type: NodeType.FOLDER,
                attributes: { unary: 1 },
                children: []
            }
            mockStore.overrideSelector(explorerTreeNodeSelector, updatedRoot)
            mockStore.refreshState()

            // Act & Assert
            store.rootNode$.subscribe(value => {
                expect(value).toEqual(updatedRoot)
                done()
            })
        })
    })
})
