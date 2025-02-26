import { TestBed } from "@angular/core/testing"
import { BehaviorSubject } from "rxjs"
import { EffectsModule } from "@ngrx/effects"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { UpdateAmountOfEdgePreviewsEffect } from "./updateAmountOfEdgePreviews.effect"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../selectors/amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector"
import { amountOfEdgePreviewsSelector } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { defaultAmountOfEdgesPreviews } from "../../store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.reducer"

describe("UpdateAmountOfEdgePreviewsEffect", () => {
    let actions$: BehaviorSubject<Action>
    let store: MockStore

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([UpdateAmountOfEdgePreviewsEffect])],
            providers: [
                provideMockStore({
                    selectors: [
                        {
                            selector: amountOfBuildingsWithSelectedEdgeMetricSelector,
                            value: 10
                        },
                        {
                            selector: amountOfEdgePreviewsSelector,
                            value: 9
                        }
                    ]
                }),
                provideMockActions(() => actions$)
            ]
        })
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should skip the first change of amountOfBuildingsWithSelectedEdgeMetricSelector", async () => {
        store.overrideSelector(amountOfBuildingsWithSelectedEdgeMetricSelector, 9)
        store.refreshState()
        expect(await getLastAction(store)).toEqual({ type: "@ngrx/effects/init" })
    })

    it("should dispatch amount of edge preview to max", async () => {
        store.overrideSelector(amountOfBuildingsWithSelectedEdgeMetricSelector, 7)
        store.refreshState()

        store.overrideSelector(amountOfBuildingsWithSelectedEdgeMetricSelector, 3)
        store.refreshState()

        expect(await getLastAction(store)).toEqual({ type: "SET_AMOUNT_OF_EDGE_PREVIEWS", value: 3 })
    })

    it("should dispatch amount of edge preview to default when amountOfEdgePreviewsSelector was 0 before", async () => {
        store.overrideSelector(amountOfEdgePreviewsSelector, 0)
        store.refreshState()

        store.overrideSelector(amountOfBuildingsWithSelectedEdgeMetricSelector, 3)
        store.refreshState()

        expect(await getLastAction(store)).toEqual({ type: "SET_AMOUNT_OF_EDGE_PREVIEWS", value: defaultAmountOfEdgesPreviews })
    })
})
