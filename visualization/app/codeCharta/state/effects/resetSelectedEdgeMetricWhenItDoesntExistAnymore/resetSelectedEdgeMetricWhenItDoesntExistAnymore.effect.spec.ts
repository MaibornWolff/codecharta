import { TestBed } from "@angular/core/testing"
import { edgeMetricDataSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { edgeMetricSelector, setEdgeMetric } from "../../../mapState/mapState.facade"
import { ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect } from "./resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect", () => {
    let store: MockStore

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect])],
            providers: [
                provideMockStore({
                    selectors: [
                        { selector: edgeMetricSelector, value: "avgCommits" },
                        { selector: edgeMetricDataSelector, value: [{ name: "avgCommits" }, { name: "pairingRate" }] }
                    ]
                })
            ]
        })
        store = TestBed.inject(MockStore)
    })

    it("should reset selected edge metric to first available, when current isn't available anymore", async () => {
        store.overrideSelector(edgeMetricDataSelector, [{ name: "pairingRate" }] as ReturnType<typeof edgeMetricDataSelector>)
        store.refreshState()
        expect(await getLastAction(store)).toEqual(setEdgeMetric({ value: "pairingRate" }))
    })

    it("should do nothing, when current selected edge metric is still available", async () => {
        store.overrideSelector(edgeMetricDataSelector, [{ name: "avgCommits" }] as ReturnType<typeof edgeMetricDataSelector>)
        store.refreshState()
        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
    })

    it("should set set edge metric to undefined, when there is no edge metric available", async () => {
        store.overrideSelector(edgeMetricSelector, "pairingRate")
        store.overrideSelector(edgeMetricDataSelector, [] as ReturnType<typeof edgeMetricDataSelector>)
        store.refreshState()
        expect(await getLastAction(store)).toEqual(setEdgeMetric(undefined))
    })
})
