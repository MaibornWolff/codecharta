import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { BlacklistSearchPatternEffect } from "./blacklistSearchPattern.effect"
import { SearchBarComponent } from "./searchBar.component"
import { SearchBarModule } from "./searchBar.module"
import userEvent from "@testing-library/user-event"
import { Store as PlainStore } from "../../../state/store/store"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { EffectsModule } from "../../../state/angular-redux/effects/effects.module"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { Subject } from "rxjs"
import { Action } from "redux"
import { resultsInEmptyMap } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap"
import { MatLegacyDialog } from "@angular/material/legacy-dialog"

jest.mock("../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap", () => ({
	resultsInEmptyMap: jest.fn()
}))

const mockedResultsInEmptyMap = jest.mocked(resultsInEmptyMap)

describe("cc-search-bar", () => {
	const mockedDialog = { open: jest.fn() }

	beforeEach(async () => {
		PlainStore["initialize"]()
		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [
				EffectsModule.forRoot([BlacklistSearchPatternEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect]),
				SearchBarModule
			],
			providers: [{ provide: MatLegacyDialog, useValue: mockedDialog }]
		})
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should be a debounced field for search pattern with clear button if is not empty", async () => {
		await render(SearchBarComponent, { excludeComponentDeclaration: true })
		const dispatchSpy = jest.spyOn(PlainStore.store, "dispatch")

		expect(screen.queryByTestId("search-bar-clear-button")).toBe(null)

		let searchField = screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement
		await userEvent.type(searchField, "needle", { delay: 1 })

		const clearButton = await screen.findByTestId("search-bar-clear-button")
		expect(dispatchSpy).toHaveBeenCalledTimes(1)
		expect(searchPatternSelector(PlainStore.store.getState())).toBe("needle")

		await userEvent.click(clearButton)

		searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		expect(searchField.value).toBe("")
		expect(searchPatternSelector(PlainStore.store.getState())).toBe("")
	})

	it("should flatten pattern", async () => {
		await render(SearchBarComponent, { excludeComponentDeclaration: true })

		let searchField = screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")
		await userEvent.click(screen.getByTitle("Add to Blacklist"))

		await userEvent.click(await screen.findByTestId("search-bar-flatten-button"))

		searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		expect(searchField.value).toBe("")
		expect(PlainStore.store.getState().fileSettings.blacklist[0]).toEqual({ type: "flatten", path: "*needle*" })
	})

	it("should exclude pattern", async () => {
		mockedResultsInEmptyMap.mockImplementation(() => false)
		await render(SearchBarComponent, { excludeComponentDeclaration: true })

		let searchField = screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")
		await userEvent.click(screen.getByTitle("Add to Blacklist"))

		await userEvent.click(await screen.findByTestId("search-bar-exclude-button"))

		searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		expect(searchField.value).toBe("")
		expect(PlainStore.store.getState().fileSettings.blacklist[0]).toEqual({ type: "exclude", path: "*needle*" })
	})
})
