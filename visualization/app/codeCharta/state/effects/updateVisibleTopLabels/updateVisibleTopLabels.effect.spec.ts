import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { ApplicationInitStatus } from "@angular/core"
import { UpdateVisibleTopLabelsEffect } from "./updateVisibleTopLabels.effect"
import {setAmountOfTopLabels} from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import {codeMapNodesSelector} from "../../selectors/accumulatedData/codeMapNodes.selector"
import {Subject} from "rxjs"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { Store } from "../../angular-redux/store"
import { Store as PlainStoreUsedByEffects } from "../../store/store"

describe("updateVisibleTopLabelsEffect", () => {
	let mockedVisibleFileStatesSelector = new Subject()
	let mockedCodeMapNodesSelector = new Subject()

	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case visibleFileStatesSelector:
					return mockedVisibleFileStatesSelector
				case codeMapNodesSelector:
					return mockedCodeMapNodesSelector
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
		mockedCodeMapNodesSelector = new Subject()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UpdateVisibleTopLabelsEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedVisibleFileStatesSelector.complete()
		mockedCodeMapNodesSelector.complete()
	})

	it("should set setAmountOfTopLabels to 1 on FileState change when number of nodes are equal or less than 100", () => {
		mockedCodeMapNodesSelector.next(Array.from({ length: 10 }).fill({}))
		mockedVisibleFileStatesSelector.next([])
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAmountOfTopLabels(1))
	})

	it("should set setAmountOfTopLabels to 2 on FileState change when number of nodes are greater than or equal to 200 and less than 300", () => {
		mockedCodeMapNodesSelector.next(Array.from({ length: 200 }).fill({}))
		mockedVisibleFileStatesSelector.next([])
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAmountOfTopLabels(2))
	})

	it("should set setAmountOfTopLabels to 10 (max limit for displayed top labels) on FileState change when number of nodes are greater than 1000", () => {
		mockedCodeMapNodesSelector.next(Array.from({ length: 1001 }).fill({}))
		mockedVisibleFileStatesSelector.next([])
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAmountOfTopLabels(10))
	})
})
