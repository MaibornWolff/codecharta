import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { MatLegacyDialog } from "@angular/material/legacy-dialog"
import { Action } from "redux"
import { Subject } from "rxjs"
import { EffectsModule } from "../../../state/angular-redux/effects/effects.module"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { resultsInEmptyMap } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap"
import { setSearchPattern } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { addBlacklistItemsIfNotResultsInEmptyMap } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { Store } from "../../../state/store/store"
import { blacklistSearchPattern, BlacklistSearchPatternEffect } from "./blacklistSearchPattern.effect"

jest.mock("../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap", () => ({
	resultsInEmptyMap: jest.fn()
}))

const mockedResultsInEmptyMap = jest.mocked(resultsInEmptyMap)

describe("BlacklistSearchPatternEffect", () => {
	const mockedDialog = { open: jest.fn() }

	beforeEach(async () => {
		Store["initialize"]()
		mockedDialog.open = jest.fn()

		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([BlacklistSearchPatternEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect])],
			providers: [{ provide: MatLegacyDialog, useValue: mockedDialog }]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should exclude pattern and reset search pattern", () => {
		mockedResultsInEmptyMap.mockImplementation(() => false)
		Store.dispatch(setSearchPattern("needle"))

		EffectsModule.actions$.next(blacklistSearchPattern("exclude"))

		expect(Store.store.getState().dynamicSettings.searchPattern).toBe("")
		expect(Store.store.getState().fileSettings.blacklist).toEqual([{ type: "exclude", path: "*needle*" }])
	})

	it("should not reset search pattern, when excluding from search bar failed and afterwards excluding within CodeCharta map", () => {
		mockedResultsInEmptyMap.mockImplementation(() => true)
		Store.dispatch(setSearchPattern("root"))
		EffectsModule.actions$.next(blacklistSearchPattern("exclude"))

		mockedResultsInEmptyMap.mockImplementation(() => false)
		EffectsModule.actions$.next(addBlacklistItemsIfNotResultsInEmptyMap([{ type: "exclude", path: "*needle*" }]))

		expect(Store.store.getState().dynamicSettings.searchPattern).toBe("root")
	})
})
