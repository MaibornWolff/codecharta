import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"

import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { State } from "../../angular-redux/state"
import { setFiles } from "../../store/files/files.actions"
import { setState } from "../../store/state.actions"
import { Store } from "../../store/store"
import { UpdateFileSettingsEffect } from "./updateFileSettings.effect"

describe("UpdateFileSettingsEffect", () => {
	const mockedDialog = { open: jest.fn() }
	let storeDispatchSpy

	beforeEach(async () => {
		storeDispatchSpy = jest.spyOn(Store, "dispatch")
		mockedDialog.open = jest.fn()

		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([UpdateFileSettingsEffect])],
			providers: [{ provide: State, useValue: { getValue: () => ({ files: [] }) } }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should ignore a not relevant action", () => {
		EffectsModule.actions$.next({ type: "whatever" })
		expect(storeDispatchSpy).not.toHaveBeenCalled()
	})

	it("should not blacklist items if it would lead to an empty map but show error dialog", () => {
		EffectsModule.actions$.next(setFiles([]))
		expect(storeDispatchSpy).not.toHaveBeenCalledWith(
			setState({
				fileSettings: {
					edges: [],
					markedPackages: [],
					blacklist: [],
					attributeTypes: {}
				}
			})
		)
	})
})
