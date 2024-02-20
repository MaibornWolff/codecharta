import { TestBed } from "@angular/core/testing"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { selectedColorMetricDataSelector } from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { ResetColorRangeEffect } from "./resetColorRange.effect"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { BehaviorSubject } from "rxjs"
import { Action } from "@ngrx/store"
import { setStandard } from "../../files/files.actions"
import { getLastAction } from "../../../../util/testUtils/store.utils"
import { setColorMetric } from "../colorMetric/colorMetric.actions"

describe("ResetColorRangeEffect", () => {
	let actions$: BehaviorSubject<Action>

	beforeEach(() => {
		actions$ = new BehaviorSubject({ type: "" })
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([ResetColorRangeEffect])],
			providers: [
				provideMockStore({
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

	it("should fire on file selection actions after color metric data are recalculated", async () => {
		const store = TestBed.inject(MockStore)
		actions$.next(setStandard({ files: [] }))
		store.overrideSelector(selectedColorMetricDataSelector, { minValue: 20, maxValue: 120, values: [20, 120] })
		store.refreshState()
		expect(await getLastAction(store)).toEqual({ value: { from: 53, to: 86 }, type: "SET_COLOR_RANGE" })
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
