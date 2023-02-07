import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { BehaviorSubject, Subject } from "rxjs"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { metricDataSelector } from "../../selectors/accumulatedData/metricData/metricData.selector"
import { areChosenMetricsAvailableSelector } from "../../selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"
import { setDistributionMetric } from "../../store/dynamicSettings/distributionMetric/distributionMetric.actions"
import { setHeightMetric } from "../../store/dynamicSettings/heightMetric/heightMetric.actions"
import { ResetChosenMetricsEffect } from "./resetChosenMetrics.effect"

describe("resetChosenMetricsEffect", () => {
	let mockedMetricDataSelector = new Subject()
	const mockedAreChosenMetricsAvailableSelector = new BehaviorSubject(false)
	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case metricDataSelector:
					return mockedMetricDataSelector
				case areChosenMetricsAvailableSelector:
					return mockedAreChosenMetricsAvailableSelector
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedStore.dispatch = jest.fn()
		mockedMetricDataSelector = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([ResetChosenMetricsEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedMetricDataSelector.complete()
	})

	it("should do nothing, when there are no metrics available", () => {
		mockedMetricDataSelector.next({ nodeMetricData: [] })
		expect(mockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should apply matching metrics, when area, height and color metrics of matching category are available", () => {
		mockedMetricDataSelector.next({
			nodeMetricData: [
				{ name: "rloc", maxValue: 9001 },
				{ name: "mcc", maxValue: 9001 }
			]
		})

		expect(mockedStore.dispatch).toHaveBeenCalledTimes(4)
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setDistributionMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAreaMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setHeightMetric("mcc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setColorMetric("mcc"))
	})

	it("should apply available metrics when no matching scenario was found", () => {
		mockedMetricDataSelector.next({
			nodeMetricData: [
				{ name: "rloc", maxValue: 9001 },
				{ name: "loc", maxValue: 9001 }
			]
		})

		expect(mockedStore.dispatch).toHaveBeenCalledTimes(4)
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setDistributionMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAreaMetric("rloc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setHeightMetric("loc"))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setColorMetric("loc"))
	})

	it("should do nothing, when chosen metrics are still available", () => {
		mockedAreChosenMetricsAvailableSelector.next(true)
		mockedMetricDataSelector.next({
			nodeMetricData: [
				{ name: "rloc", maxValue: 9001 },
				{ name: "loc", maxValue: 9001 }
			]
		})

		expect(mockedStore.dispatch).not.toHaveBeenCalled()
	})
})
