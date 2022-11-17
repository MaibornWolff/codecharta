import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { defaultMargin, setMargin } from "../../store/dynamicSettings/margin/margin.actions"
import { Store as PlainStoreUsedByEffects } from "../../store/store"
import { ResetDynamicMarginEffect } from "./resetDynamicMargin.effect"

describe("resetDynamicMarginEffect", () => {
	let mockedDynamicMarginSelector = new Subject()

	const mockedStore = {
		select: () => mockedDynamicMarginSelector,
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedStore.dispatch = jest.fn()
		PlainStoreUsedByEffects.store.dispatch = mockedStore.dispatch
		mockedDynamicMarginSelector = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([ResetDynamicMarginEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedDynamicMarginSelector.complete()
	})

	it("should do nothing, when dynamicMargin changes to false", () => {
		mockedDynamicMarginSelector.next(false)
		expect(mockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should reset margin to its default when dynamicMargin changes to true", () => {
		mockedDynamicMarginSelector.next(true)
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setMargin(defaultMargin))
	})

	it("should do nothing, when dynamicMargin stays true", () => {
		mockedDynamicMarginSelector.next(true)
		mockedDynamicMarginSelector.next(true)
		expect(mockedStore.dispatch).toHaveBeenCalledTimes(1)
	})
})
