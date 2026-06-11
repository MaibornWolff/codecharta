import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { CodeMapNode } from "../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { InspectorHeaderService } from "./inspectorHeader.service"

describe("InspectorHeaderService", () => {
    let service: InspectorHeaderService
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: selectedNodeSelector, value: undefined },
                        { selector: isDeltaStateSelector, value: false }
                    ]
                })
            ]
        })

        mockStore = TestBed.inject(MockStore)
        service = TestBed.inject(InspectorHeaderService)
    })

    it("should expose the selected node", done => {
        // Arrange
        const node = { name: "invoice.ts", path: "/root/invoice.ts" } as CodeMapNode
        mockStore.overrideSelector(selectedNodeSelector, node)
        mockStore.refreshState()

        // Act & Assert
        service.selectedNode$().subscribe(value => {
            expect(value).toBe(node)
            done()
        })
    })

    it("should expose the delta state", done => {
        // Arrange
        mockStore.overrideSelector(isDeltaStateSelector, true)
        mockStore.refreshState()

        // Act & Assert
        service.isDeltaState$().subscribe(value => {
            expect(value).toBe(true)
            done()
        })
    })
})
