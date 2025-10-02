import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { MetricDistributionService } from "./metricDistribution.service"
import { hoveredNodeMetricDistributionSelector } from "./selectors/hoveredNodeMetricDistribution.selector"
import { CategorizedMetricDistribution } from "./selectors/fileExtensionCalculator"

describe("MetricDistributionService", () => {
    let service: MetricDistributionService
    const mockDistribution: CategorizedMetricDistribution = {
        none: [],
        visible: [
            {
                fileExtension: "ts",
                absoluteMetricValue: 100,
                relativeMetricValue: 50,
                color: "hsl(0, 50%, 50%)"
            }
        ],
        others: []
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MetricDistributionService,
                provideMockStore({
                    selectors: [{ selector: hoveredNodeMetricDistributionSelector, value: mockDistribution }]
                })
            ]
        })
        service = TestBed.inject(MetricDistributionService)
    })

    it("should be created", () => {
        expect(service).toBeTruthy()
    })

    it("should expose hoveredNodeMetricDistribution$ observable", done => {
        service.hoveredNodeMetricDistribution$.subscribe(distribution => {
            expect(distribution).toEqual(mockDistribution)
            done()
        })
    })
})
