import { render, screen, waitFor } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { BlacklistSearchPatternEffect } from "./blacklistSearchPattern.effect"
import { SearchBarComponent } from "./searchBar.component"
import { SearchBarModule } from "./searchBar.module"
import userEvent from "@testing-library/user-event"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import { resultsInEmptyMap } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap"
import { MatDialog } from "@angular/material/dialog"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { EffectsModule } from "@ngrx/effects"

jest.mock("../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/resultsInEmptyMap", () => ({
	resultsInEmptyMap: jest.fn()
}))

const mockedResultsInEmptyMap = jest.mocked(resultsInEmptyMap)

describe("cc-search-bar", () => {
	const mockedDialog = { open: jest.fn() }

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
				EffectsModule.forRoot([BlacklistSearchPatternEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect]),
				SearchBarModule
			],
			providers: [{ provide: MatDialog, useValue: mockedDialog }]
		})
	})

	it("should be a debounced field for search pattern with clear button if is not empty", async () => {
		await render(SearchBarComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(Store)
		const state = TestBed.inject(State)
		const dispatchSpy = jest.spyOn(store, "dispatch")

		expect(screen.queryByTestId("search-bar-clear-button")).toBe(null)

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement
		await userEvent.type(searchField, "needle", { delay: 1 })

		const clearButton = await screen.findByTestId("search-bar-clear-button")
		expect(dispatchSpy).toHaveBeenCalledTimes(1)
		expect(searchPatternSelector(state.getValue())).toBe("needle")

		await userEvent.click(clearButton)

		await waitFor(() => expect((screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement).value).toBe(""))
		expect(searchPatternSelector(state.getValue())).toBe("")
	})

	it("should flatten pattern", async () => {
		await render(SearchBarComponent, { excludeComponentDeclaration: true })
		const state = TestBed.inject(State)

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")
		await userEvent.click(screen.getByTitle("Add to Blacklist"))

		await userEvent.click(await screen.findByTestId("search-bar-flatten-button"))

		await waitFor(() => expect((screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement).value).toBe(""))
		expect(state.getValue().fileSettings.blacklist[0]).toEqual({ type: "flatten", path: "*needle*" })
	})

	it("should exclude pattern", async () => {
		mockedResultsInEmptyMap.mockImplementation(() => false)
		await render(SearchBarComponent, { excludeComponentDeclaration: true })
		const state = TestBed.inject(State)

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")
		await userEvent.click(screen.getByTitle("Add to Blacklist"))

		await userEvent.click(await screen.findByTestId("search-bar-exclude-button"))

		await waitFor(() => expect((screen.getByPlaceholderText("Search: *.js, **/app/*") as HTMLInputElement).value).toBe(""))
		expect(state.getValue().fileSettings.blacklist[0]).toEqual({ type: "exclude", path: "*needle*" })
	})
})
