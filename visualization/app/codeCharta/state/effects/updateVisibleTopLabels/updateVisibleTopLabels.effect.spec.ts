import { Store as PlainStoreUsedByEffects, Store } from "../../store/store"
import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { ApplicationInitStatus } from "@angular/core"
import { UpdateVisibleTopLabelsEffect } from "./updateVisibleTopLabels.effect"
import { setAmountOfTopLabels } from "../../store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { setFiles } from "../../store/files/files.actions"
import { FILE_STATES, VALID_NODE_JAVA } from "../../../util/dataMocks"
import { codeMapNodesSelector } from "../../selectors/accumulatedData/codeMapNodesSelector"
import { Subject } from "rxjs"

import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { FileState } from "../../../model/files/files"

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

	it("should ignore a not relevant action", () => {
		Store.dispatch({ type: "whatever" })
		expect(mockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should set setAmountOfTopLabels to 1 on FileState change", () => {
		mockedVisibleFileStatesSelector.next([] as FileState[])
		mockedCodeMapNodesSelector.next([VALID_NODE_JAVA])
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAmountOfTopLabels(1))
	})

	it("should set setAmountOfTopLabels to 5 on FileState change", () => {
		Store.dispatch(setFiles(FILE_STATES))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setAmountOfTopLabels(5))
	})
})
