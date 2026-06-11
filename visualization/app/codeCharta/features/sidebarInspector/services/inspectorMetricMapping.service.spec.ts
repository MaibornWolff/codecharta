import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { inspectorMappingBlocksSelector, MappingBlock } from "../selectors/inspectorMappingBlocks.selector"
import { InspectorMetricMappingService } from "./inspectorMetricMapping.service"

describe("InspectorMetricMappingService", () => {
    let service: InspectorMetricMappingService
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideMockStore({ selectors: [{ selector: inspectorMappingBlocksSelector, value: [] }] })]
        })

        mockStore = TestBed.inject(MockStore)
        service = TestBed.inject(InspectorMetricMappingService)
    })

    it("should expose the mapping blocks", done => {
        // Arrange
        const blocks: MappingBlock[] = [{ kind: "height", metricName: "mcc", value: 41 }]
        mockStore.overrideSelector(inspectorMappingBlocksSelector, blocks)
        mockStore.refreshState()

        // Act & Assert
        service.mappingBlocks$().subscribe(value => {
            expect(value).toEqual(blocks)
            done()
        })
    })
})
