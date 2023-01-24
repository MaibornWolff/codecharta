import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { MatLegacyDialog } from "@angular/material/legacy-dialog"
import { Action } from "redux"
import { Subject } from "rxjs"
import { FILE_STATES_JAVA } from "../../../util/dataMocks"

import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setFiles } from "../../store/files/files.actions"
import { addBlacklistItems, addBlacklistItemsIfNotResultsInEmptyMap } from "../../store/fileSettings/blacklist/blacklist.actions"
import { Store } from "../../store/store"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "./addBlacklistItemsIfNotResultsInEmptyMap.effect"

describe("AddBlacklistItemsIfNotResultsInEmptyMapEffect", () => {
	const mockedDialog = { open: jest.fn() }
	let storeDispatchSpy

	beforeEach(async () => {
		Store["initialize"]()
		storeDispatchSpy = jest.spyOn(Store, "dispatch")
		mockedDialog.open = jest.fn()

		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([AddBlacklistItemsIfNotResultsInEmptyMapEffect])],
			providers: [{ provide: MatLegacyDialog, useValue: mockedDialog }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should ignore a not relevant action", () => {
		EffectsModule.actions$.next({ type: "whatever" })
		expect(storeDispatchSpy).not.toHaveBeenCalled()
		expect(mockedDialog.open).not.toHaveBeenCalled()
	})

	it("should not blacklist items if it would lead to an empty map but show error dialog", () => {
		EffectsModule.actions$.next(addBlacklistItemsIfNotResultsInEmptyMap([{ type: "exclude", path: "foo/bar" }]))
		expect(storeDispatchSpy).not.toHaveBeenCalledWith(addBlacklistItems([{ type: "exclude", path: "foo/bar" }]))
		expect(mockedDialog.open).toHaveBeenCalledTimes(1)
	})

	it("should blacklist items if it doesn't lead to an empty map", () => {
		Store.dispatch(setFiles(FILE_STATES_JAVA))

		EffectsModule.actions$.next(addBlacklistItemsIfNotResultsInEmptyMap([{ type: "exclude", path: "/root/src/main/file1.java" }]))

		expect(storeDispatchSpy).toHaveBeenCalledWith(addBlacklistItems([{ type: "exclude", path: "/root/src/main/file1.java" }]))
		expect(mockedDialog.open).not.toHaveBeenCalled()
	})
})
