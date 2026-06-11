import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CodeMapNode } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { selectedBuildingIdSelector } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.selector"
import { InspectorSelectedNodeStore } from "./selectedNode.store"

describe("InspectorSelectedNodeStore", () => {
    let store: InspectorSelectedNodeStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                InspectorSelectedNodeStore,
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: undefined },
                        { selector: selectedBuildingIdSelector, value: null }
                    ]
                })
            ]
        })

        store = TestBed.inject(InspectorSelectedNodeStore)
        mockStore = TestBed.inject(MockStore)
    })

    it("should emit the selected node from the selector", done => {
        // Arrange
        const node = { name: "invoice.ts", path: "/root/invoice.ts" } as CodeMapNode
        mockStore.overrideSelector(selectedNodeSelector, node)
        mockStore.refreshState()

        // Act & Assert
        store.selectedNode$.subscribe(value => {
            expect(value).toBe(node)
            done()
        })
    })

    it("should emit the selected building id from the selector", done => {
        // Arrange
        mockStore.overrideSelector(selectedBuildingIdSelector, 42)
        mockStore.refreshState()

        // Act & Assert
        store.selectedBuildingId$.subscribe(value => {
            expect(value).toBe(42)
            done()
        })
    })
})
