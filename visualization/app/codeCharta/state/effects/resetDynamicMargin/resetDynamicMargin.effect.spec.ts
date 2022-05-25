import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { mocked } from "ts-jest/utils"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setDynamicMargin } from "../../store/appSettings/dynamicMargin/dynamicMargin.actions"
import { resetSelection } from "../../store/files/files.actions"
import { Store } from "../../store/store"
import { ResetDynamicMarginEffect } from "./resetDynamicMargin.effect"

jest.mock("../../store/store", () => ({
	Store: {}
}))

describe("resetDynamicMarginEffect", () => {
	const MockedStore = mocked(Store)

	beforeEach(async () => {
		MockedStore.dispatch = jest.fn()

		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([ResetDynamicMarginEffect])]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should ignore a not relevant action", () => {
		EffectsModule.actions$.next({ type: "whatever" })
		expect(MockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should reset default margin to true on file selection actions", () => {
		EffectsModule.actions$.next(resetSelection())
		expect(MockedStore.dispatch).toHaveBeenLastCalledWith(setDynamicMargin(true))
	})
})
