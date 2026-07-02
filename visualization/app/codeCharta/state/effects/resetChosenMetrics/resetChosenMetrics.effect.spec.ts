import { TestBed } from "@angular/core/testing"
import { nodeMetricDataSelector } from "../../../lenses/metrics/metricsLens.facade"
import { areChosenMetricsAvailableSelector } from "../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { setAreaMetric, setColorMetric, setDistributionMetric, setHeightMetric } from "../../../mapState/mapState.facade"
import { ResetChosenMetricsEffect } from "./resetChosenMetrics.effect"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"

describe("resetChosenMetricsEffect", () => {
    let store: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([ResetChosenMetricsEffect])],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: nodeMetricDataSelector, value: [] },
                        { selector: areChosenMetricsAvailableSelector, value: false }
                    ]
                })
            ]
        })
        store = TestBed.inject(MockStore)
        store.dispatch = jest.fn()
    })

    it("should do nothing, when there are no metrics available", () => {
        expect(store.dispatch).not.toHaveBeenCalled()
    })

    it("should apply matching metrics, when area, height and color metrics of matching category are available", () => {
        store.overrideSelector(nodeMetricDataSelector, [
            { name: "rloc", maxValue: 9001 },
            { name: "mcc", maxValue: 9001 }
        ] as any)
        store.refreshState()

        expect(store.dispatch).toHaveBeenCalledTimes(4)
        expect(store.dispatch).toHaveBeenCalledWith(setDistributionMetric({ value: "rloc" }))
        expect(store.dispatch).toHaveBeenCalledWith(setAreaMetric({ value: "rloc" }))
        expect(store.dispatch).toHaveBeenCalledWith(setHeightMetric({ value: "mcc" }))
        expect(store.dispatch).toHaveBeenCalledWith(setColorMetric({ value: "mcc" }))
    })

    it("should apply available metrics when no matching scenario was found", () => {
        store.overrideSelector(nodeMetricDataSelector, [
            { name: "rloc", maxValue: 9001 },
            { name: "loc", maxValue: 9001 }
        ] as any)
        store.refreshState()

        expect(store.dispatch).toHaveBeenCalledTimes(4)
        expect(store.dispatch).toHaveBeenCalledWith(setDistributionMetric({ value: "rloc" }))
        expect(store.dispatch).toHaveBeenCalledWith(setAreaMetric({ value: "rloc" }))
        expect(store.dispatch).toHaveBeenCalledWith(setHeightMetric({ value: "loc" }))
        expect(store.dispatch).toHaveBeenCalledWith(setColorMetric({ value: "loc" }))
    })

    it("should do nothing, when chosen metrics are still available", () => {
        store.overrideSelector(areChosenMetricsAvailableSelector, true)
        store.overrideSelector(nodeMetricDataSelector, [
            { name: "rloc", maxValue: 9001 },
            { name: "loc", maxValue: 9001 }
        ] as any)
        store.refreshState()

        expect(store.dispatch).not.toHaveBeenCalled()
    })
})
