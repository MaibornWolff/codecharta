import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"

import { EffectsModule } from "../angular-redux/effects/effects.module"
import { setIsLoadingFile } from "../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { unfocusAllNodes } from "../store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { Store } from "../store/store"
import { UnfocusNodesOnLoadingMapEffect } from "./unfocusNodesOnLoadingMap.effect"

describe("UnfocusNodesOnLoadingMapEffect", () => {
	beforeEach(async () => {
		Store["initialize"]()

		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UnfocusNodesOnLoadingMapEffect])]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should do nothing on a not relevant action", () => {
		const dispatchSpy = jest.spyOn(Store.store, "dispatch")
		EffectsModule.actions$.next({ type: "whatever" })
		expect(dispatchSpy).toHaveBeenCalledTimes(0)
	})

	it("should fire an unfocusAllNodes action on a setIsLoadingFile action", () => {
		const dispatchSpy = jest.spyOn(Store.store, "dispatch")
		EffectsModule.actions$.next(setIsLoadingFile(true))
		expect(dispatchSpy).toHaveBeenCalledWith(unfocusAllNodes())
	})
})
