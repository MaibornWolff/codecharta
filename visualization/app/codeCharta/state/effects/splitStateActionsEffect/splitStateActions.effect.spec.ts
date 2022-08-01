import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { STATE } from "../../../util/dataMocks"

import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setDynamicSettings } from "../../store/dynamicSettings/dynamicSettings.actions"
import { setState } from "../../store/state.actions"
import { Store } from "../../store/store"
import { SplitStateActionsEffect } from "./splitStateActions.effect"

describe("SplitStateActionsEffect", () => {
	beforeEach(async () => {
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
		const dispatchSpy = jest.spyOn(Store.store, "dispatch")
		EffectsModule.actions$.next({ type: "whatever" })
		expect(dispatchSpy).not.toHaveBeenCalled()
	})

	it("should dispatch splitted actions on splitable actions", () => {
		EffectsModule.actions$.next(setDynamicSettings({ areaMetric: "rloc" }))
		expect(Store.store.getState().dynamicSettings.areaMetric).toBe("rloc")
	})

	it("should update the whole state", () => {
		EffectsModule.actions$.next(setState(STATE))
		expect(Store.store.getState()).toEqual(STATE)
	})
})
