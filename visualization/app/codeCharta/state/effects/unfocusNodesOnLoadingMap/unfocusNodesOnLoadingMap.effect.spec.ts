import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { mocked } from "ts-jest/utils"

import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { unfocusAllNodes } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { Store } from "../../store/store"
import { UnfocusNodesOnLoadingMapEffect } from "./unfocusNodesOnLoadingMap.effect"

jest.mock("../../store/store", () => ({
	Store: {}
}))
const MockedStore = mocked(Store)

describe("UnfocusNodesOnLoadingMapEffect", () => {
	beforeEach(async () => {
		MockedStore.dispatch = jest.fn()

		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UnfocusNodesOnLoadingMapEffect])]
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

	it("should fire an unfocusAllNodes action after setIsLoadingFile to true", () => {
		EffectsModule.actions$.next(setIsLoadingFile(true))
		expect(MockedStore.dispatch).toHaveBeenCalledWith(unfocusAllNodes())
	})

	it("should ignore setIsLoadingFile to false", () => {
		EffectsModule.actions$.next(setIsLoadingFile(false))
		expect(MockedStore.dispatch).not.toHaveBeenCalled()
	})
})
