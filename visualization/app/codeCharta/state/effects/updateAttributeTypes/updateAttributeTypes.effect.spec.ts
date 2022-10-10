import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { ApplicationInitStatus } from "@angular/core"
import { Subject } from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { Store } from "../../angular-redux/store"
import { Store as PlainStoreUsedByEffects } from "../../store/store"
import { UpdateAttributeTypesEffect } from "./updateAttributeTypes.effect"
import { getMergedAttributeTypes } from "./attributeTypes.merger"
import { setAttributeTypes } from "../../store/fileSettings/attributeTypes/attributeTypes.actions"

describe("updateAttributeTypesEffect", () => {
	let mockedVisibleFileStatesSelector = new Subject()

	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case visibleFileStatesSelector:
					return mockedVisibleFileStatesSelector
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedStore.dispatch = jest.fn()
		PlainStoreUsedByEffects.store.dispatch = mockedStore.dispatch
		mockedVisibleFileStatesSelector = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UpdateAttributeTypesEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedVisibleFileStatesSelector.complete()
	})

	it("should update attributeTypes on changes of selected files", () => {
		mockedVisibleFileStatesSelector.next([])
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAttributeTypes(getMergedAttributeTypes([])))
	})
})
