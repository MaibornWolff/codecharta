import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { ApplicationInitStatus } from "@angular/core"
import { Subject } from "rxjs"
import { Store } from "../../angular-redux/store"
import { Store as PlainStoreUsedByEffects } from "../../store/store"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { LinkColorMetricToHeightMetricEffect } from "./linkColorMetricToHeightMetric.effect"
import { setColorMetric } from "../../store/dynamicSettings/colorMetric/colorMetric.actions"

describe("linkHeightAndColorMetricEffect", () => {
	let mockedHeightMetricSelector$ = new Subject()
	let mockedIsHeightAndColorMetricLinkedSelector$ = new Subject()

	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case heightMetricSelector:
					return mockedHeightMetricSelector$
				case isColorMetricLinkedToHeightMetricSelector:
					return mockedIsHeightAndColorMetricLinkedSelector$
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedStore.dispatch = jest.fn()
		PlainStoreUsedByEffects.store.dispatch = mockedStore.dispatch
		mockedHeightMetricSelector$ = new Subject()
		mockedIsHeightAndColorMetricLinkedSelector$ = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([LinkColorMetricToHeightMetricEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedHeightMetricSelector$.complete()
		mockedIsHeightAndColorMetricLinkedSelector$.complete()
	})

	it("should not set color metric when height metric changes but height and color metric are not linked", () => {
		mockedHeightMetricSelector$.next("rloc")
		mockedIsHeightAndColorMetricLinkedSelector$.next(false)
		expect(mockedStore.dispatch).not.toHaveBeenCalledWith(setColorMetric("rloc"))
	})

	it("should set color metric to the same height metric when height metric changes and height and color metric are linked", () => {
		mockedHeightMetricSelector$.next("rloc")
		mockedIsHeightAndColorMetricLinkedSelector$.next(true)
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setColorMetric("rloc"))
	})
})
