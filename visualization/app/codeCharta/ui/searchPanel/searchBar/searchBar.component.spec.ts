import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { Subject } from "rxjs"
import { EffectsModule } from "../../../state/angular-redux/effects/effects.module"
import { BlacklistSearchPatternEffect } from "./blacklistSearchPattern.effect"
import { SearchBarComponent } from "./searchBar.component"
import { SearchBarModule } from "./searchBar.module"
import { AddBlacklistItemsIfNotResultsInEmptyMapEffect } from "../../../state/effects/addBlacklistItemsIfNotResultsInEmptyMap/addBlacklistItemsIfNotResultsInEmptyMap.effect"
import userEvent from "@testing-library/user-event"
import { Store } from "../../../state/store/store"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"

describe("cc-search-bar", () => {
	beforeEach(async () => {
		Store["initialize"]()
		EffectsModule.actions$ = new Subject<Action>()
		TestBed.configureTestingModule({
			imports: [SearchBarModule, EffectsModule.forRoot([BlacklistSearchPatternEffect, AddBlacklistItemsIfNotResultsInEmptyMapEffect])]
		})
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should be a debounced field for search pattern with clear button if is not empty", async () => {
		await render(SearchBarComponent, { excludeComponentDeclaration: true })
		const dispatchSpy = jest.spyOn(Store.store, "dispatch")

		expect(screen.queryByTestId("search-bar-clear-button")).toBe(null)

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		await userEvent.type(searchField, "needle", { delay: 1 })
		const clearButton = await screen.findByTestId("search-bar-clear-button")
		expect(dispatchSpy).toHaveBeenCalledTimes(1)
		expect(searchPatternSelector(Store.store.getState())).toBe("needle")

		userEvent.click(clearButton)
		expect(searchPatternSelector(Store.store.getState())).toBe("")
	})
})
