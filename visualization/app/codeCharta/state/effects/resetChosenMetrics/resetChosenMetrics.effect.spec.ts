import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { ResetChosenMetricsEffect } from "./resetChosenMetrics.effect"

describe("resetChosenMetricsEffect", () => {
	let mockedNodeMetricDataSelector = new Subject()
	const mockedStore = {
		select: () => mockedNodeMetricDataSelector,
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedStore.dispatch = jest.fn()
		mockedNodeMetricDataSelector = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([ResetChosenMetricsEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedNodeMetricDataSelector.complete()
	})

	it("should do nothing, when there are no metrics available", () => {
		mockedNodeMetricDataSelector.next([])
		expect(mockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should reset chosen distribution metric", () => {
		mockedNodeMetricDataSelector.next([{ name: "rloc", maxValue: 9001 }])
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setDistributionMetric("rloc"))
	})
})
