import { TestBed } from "@angular/core/testing"
import { ApplicationInitStatus } from "@angular/core"
import { Subject } from "rxjs"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { edgeMetricDataSelector } from "../../selectors/accumulatedData/metricData/edgeMetricData.selector"
import { edgeMetricSelector } from "../../store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { Store as PlainStoreUsedByEffects } from "../../store/store"
import { ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect } from "./resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"

describe("ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect", () => {
	let mockedEdgeMetricDataSelector$ = new Subject()
	let mockedEdgeMetricSelector$ = new Subject()
	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case edgeMetricDataSelector:
					return mockedEdgeMetricDataSelector$
				case edgeMetricSelector:
					return mockedEdgeMetricSelector$
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedStore.dispatch = jest.fn()
		PlainStoreUsedByEffects.store.dispatch = mockedStore.dispatch
		mockedEdgeMetricDataSelector$ = new Subject()
		mockedEdgeMetricSelector$ = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedEdgeMetricDataSelector$.complete()
		mockedEdgeMetricSelector$.complete()
	})

	it("should reset selected edge metric to first available, when current isn't available anymore", () => {
		mockedEdgeMetricSelector$.next("avgCommits")
		mockedEdgeMetricDataSelector$.next([{ name: "pairingRate" }])
		expect(mockedStore.dispatch).toHaveBeenLastCalledWith(setEdgeMetric("pairingRate"))
	})

	it("should do nothing, when current selected edge metric is still available", () => {
		mockedEdgeMetricSelector$.next("avgCommits")
		mockedEdgeMetricDataSelector$.next([{ name: "avgCommits" }])
		expect(mockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should not set reselect edge metric to null", () => {
		mockedEdgeMetricSelector$.next("avgCommits")
		mockedEdgeMetricDataSelector$.next([])
		expect(mockedStore.dispatch).toHaveBeenLastCalledWith(setEdgeMetric(undefined))

		mockedEdgeMetricDataSelector$.next([])
		expect(mockedStore.dispatch).toHaveBeenCalledTimes(1)
	})
})
