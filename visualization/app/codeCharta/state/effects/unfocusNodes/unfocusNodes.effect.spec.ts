import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { Store as PlainStoreUsedByEffects } from "../../store/store"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { unfocusAllNodes } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { UnfocusNodesEffect } from "./unfocusNodes.effect"
import { Store } from "../../angular-redux/store"

describe("UnfocusNodesEffect", () => {
	let mockedVisibleFileStates$: Subject<unknown>
	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case visibleFileStatesSelector:
					return mockedVisibleFileStates$
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		mockedVisibleFileStates$ = new Subject()
		PlainStoreUsedByEffects.store.dispatch = mockedStore.dispatch
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UnfocusNodesEffect])],
			providers: [{ provide: Store, useValue: mockedStore }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		mockedVisibleFileStates$.complete()
	})

	it("should unfocus all nodes on visible file state changes", () => {
		mockedVisibleFileStates$.next("")
		expect(mockedStore.dispatch).toHaveBeenCalledWith(unfocusAllNodes())
	})
})
