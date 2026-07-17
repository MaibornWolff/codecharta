import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject } from "rxjs"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA, TEST_FILE_DATA_TWO } from "../../../../mocks/dataMocks"
import { FileSelectionState } from "../../../../model/files/files"
import { selectedColorMetricDataSelector } from "../../../../renderer/renderModel/accumulatedData/metricData/selectedColorMetricData.selector"
import { setColorMetric } from "../../../../stores/mapState/mapState.write.facade"
import { getLastAction } from "../../../../util/testUtils/store.utils"
import { ResetColorRangeEffect } from "./resetColorRange.effect"

describe("ResetColorRangeEffect", () => {
    const modifiedDefaultState = {
        files: [
            { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA },
            { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA_TWO },
            { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA_JAVA }
        ]
    }

    let actions$: BehaviorSubject<Action>

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([ResetColorRangeEffect])],
            providers: [
                provideMockStore({
                    initialState: modifiedDefaultState,
                    selectors: [
                        {
                            selector: selectedColorMetricDataSelector,
                            value: { minValue: 0, maxValue: 0 }
                        }
                    ]
                }),
                provideMockActions(() => actions$)
            ]
        })
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should not fire when only selectedColorMetricData changed", async () => {
        const store = TestBed.inject(MockStore)
        store.overrideSelector(selectedColorMetricDataSelector, { minValue: 20, maxValue: 120, values: [20, 120] })
        store.refreshState()
        expect(await getLastAction(store)).not.toEqual({ value: { from: 53, to: 86 }, type: "SET_COLOR_RANGE" })
    })

    it("should fire when colorMetric selection changed", async () => {
        const store = TestBed.inject(MockStore)
        store.overrideSelector(selectedColorMetricDataSelector, { minValue: 20, maxValue: 120, values: [20, 120] })
        store.refreshState()
        actions$.next(setColorMetric({ value: "anotherMetric" }))
        expect(await getLastAction(store)).toEqual({ value: { from: 53, to: 86 }, type: "SET_COLOR_RANGE" })
    })
})
