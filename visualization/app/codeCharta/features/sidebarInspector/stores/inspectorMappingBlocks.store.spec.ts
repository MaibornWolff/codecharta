import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { inspectorMappingBlocksSelector, MappingBlock } from "../selectors/inspectorMappingBlocks.selector"
import { InspectorMappingBlocksStore } from "./inspectorMappingBlocks.store"

describe("InspectorMappingBlocksStore", () => {
    let store: InspectorMappingBlocksStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                InspectorMappingBlocksStore,
                provideMockStore({ selectors: [{ selector: inspectorMappingBlocksSelector, value: [] }] })
            ]
        })

        store = TestBed.inject(InspectorMappingBlocksStore)
        mockStore = TestBed.inject(MockStore)
    })

    it("should emit the mapping blocks from the selector", done => {
        // Arrange
        const blocks: MappingBlock[] = [{ kind: "area", metricName: "rloc", value: 842 }]
        mockStore.overrideSelector(inspectorMappingBlocksSelector, blocks)
        mockStore.refreshState()

        // Act & Assert
        store.mappingBlocks$.subscribe(value => {
            expect(value).toEqual(blocks)
            done()
        })
    })
})
