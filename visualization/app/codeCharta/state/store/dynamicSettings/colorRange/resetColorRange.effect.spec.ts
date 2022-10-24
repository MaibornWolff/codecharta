import { TestBed } from "@angular/core/testing"
import { ApplicationInitStatus } from "@angular/core"
import { Subject } from "rxjs"
import {
	MetricMinMax,
	selectedColorMetricDataSelector
} from "../../../selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { ActionsToken, EffectsModule } from "../../../angular-redux/effects/effects.module"
import { Store } from "../../../angular-redux/store"
import { Store as PlainStoreUsedByEffects } from "../../../store/store"
import { ResetColorRangeEffect } from "./resetColorRange.effect"
import { Action } from "redux"
import { FilesSelectionActions } from "../../files/files.actions"
import { setColorRange } from "./colorRange.actions"

describe("ResetColorRangeEffect", () => {
	let selectedColorMetricDataSelector$ = new Subject<MetricMinMax>()
	let actions$ = new Subject<Action>()
	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case selectedColorMetricDataSelector:
					return selectedColorMetricDataSelector$
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedStore.dispatch = jest.fn()
		PlainStoreUsedByEffects.store.dispatch = mockedStore.dispatch
		selectedColorMetricDataSelector$ = new Subject()
		actions$ = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([ResetColorRangeEffect])],
			providers: [
				{ provide: Store, useValue: mockedStore },
				{ provide: ActionsToken, useValue: actions$ }
			]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		selectedColorMetricDataSelector$.complete()
		actions$.complete()
	})

	it("should not fire when only selectedColorMetricData changed", () => {
		selectedColorMetricDataSelector$.next({ minValue: 20, maxValue: 120 })
		expect(mockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should fire on file selection actions", () => {
		selectedColorMetricDataSelector$.next({ minValue: 20, maxValue: 120 })
		actions$.next({ type: FilesSelectionActions.SET_STANDARD })
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setColorRange({ from: 53, to: 86 }))
		expect(mockedStore.dispatch).toHaveBeenCalledTimes(1)
	})
})
