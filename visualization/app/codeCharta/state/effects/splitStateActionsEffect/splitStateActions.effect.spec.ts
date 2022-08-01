import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { mocked } from "ts-jest/utils"

import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setAreaMetric } from "../../store/dynamicSettings/areaMetric/areaMetric.actions"
import { setDynamicSettings } from "../../store/dynamicSettings/dynamicSettings.actions"
import { Store } from "../../store/store"
import { SplitStateActionsEffect } from "./splitStateActions.effect"

jest.mock("../../store/store", () => ({
	Store: {}
}))
const MockedStore = mocked(Store)

describe("SplitStateActionsEffect", () => {
	beforeEach(async () => {
		MockedStore.dispatch = jest.fn()

		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([SplitStateActionsEffect])]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should do nothing on not splitable actions", () => {
		EffectsModule.actions$.next({ type: "whatever" })
		expect(MockedStore.dispatch).not.toHaveBeenCalled()
	})

	it("should dispatch splitted actions on splitable actions", () => {
		EffectsModule.actions$.next(setDynamicSettings({ areaMetric: "rloc" }))
		expect(MockedStore.dispatch).toHaveBeenCalledWith(setAreaMetric("rloc"))
	})
})
