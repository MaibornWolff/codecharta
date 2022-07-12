import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
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

	it("should apply matching metrics, when area, height and color metrics of matching category are available", () => {
		mockedNodeMetricDataSelector.next([
			{ name: "rloc", maxValue: 9001 },
			{ name: "mcc", maxValue: 9001 }
		])

		expect(mockedStore.dispatch).toHaveBeenCalledTimes(4)
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setDistributionMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAreaMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setHeightMetric("mcc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setColorMetric("mcc"))
	})

	it("should apply available metrics when no matching scenario was found", () => {
		mockedNodeMetricDataSelector.next([
			{ name: "rloc", maxValue: 9001 },
			{ name: "loc", maxValue: 9001 }
		])

		expect(mockedStore.dispatch).toHaveBeenCalledTimes(4)
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setDistributionMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAreaMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setHeightMetric("loc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setColorMetric("loc"))
	})
})
