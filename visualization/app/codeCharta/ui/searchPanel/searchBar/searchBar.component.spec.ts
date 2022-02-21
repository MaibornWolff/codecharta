import { render, screen } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { blacklistSearchPattern } from "./blacklistSearchPattern.effect"
import { SearchBarComponent } from "./searchBar.component"
import { SearchBarModule } from "./searchBar.module"
import userEvent from "@testing-library/user-event"
import { Store } from "../../../state/store/store"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { BlacklistType } from "../../../codeCharta.model"
import { setBlacklist } from "../../../state/store/fileSettings/blacklist/blacklist.actions"

describe("cc-search-bar", () => {
	beforeEach(async () => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [SearchBarModule]
		})
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

	it("should fire blacklistSearchPattern action for flattening", async () => {
		const dispatchSpy = jest.spyOn(Store.store, "dispatch")
		await render(SearchBarComponent, { excludeComponentDeclaration: true })

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")

		userEvent.click(screen.getByTitle("Add to Blacklist"))
		userEvent.click(await screen.findByTestId("search-bar-flatten-button"))

		expect(dispatchSpy).toHaveBeenCalledWith(blacklistSearchPattern(BlacklistType.flatten))
	})

	it("should fire blacklistSearchPattern action for excluding and clear input afterwards", async () => {
		const dispatchSpy = jest.spyOn(Store.store, "dispatch")
		await render(SearchBarComponent, { excludeComponentDeclaration: true })

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")

		userEvent.click(screen.getByTitle("Add to Blacklist"))
		userEvent.click(await screen.findByTestId("search-bar-exclude-button"))

		expect(dispatchSpy).toHaveBeenCalledWith(blacklistSearchPattern(BlacklistType.exclude))
	})

	it("should disable flatten button when search pattern is already flattened", async () => {
		Store.dispatch(setBlacklist([{ path: "*needle*", type: BlacklistType.flatten }]))
		await render(SearchBarComponent, { excludeComponentDeclaration: true })

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")

		userEvent.click(screen.getByTitle("Add to Blacklist"))
		const flattenButton = (await screen.findByTestId("search-bar-flatten-button")) as HTMLButtonElement

		expect(flattenButton.disabled).toBe(true)
	})

	it("should disable exclude button when search pattern is already excluded", async () => {
		Store.dispatch(setBlacklist([{ path: "*needle*", type: BlacklistType.exclude }]))
		await render(SearchBarComponent, { excludeComponentDeclaration: true })

		const searchField = screen.getByPlaceholderText("Search: *.js, **/app/*")
		await userEvent.type(searchField, "needle")
		await screen.findByTestId("search-bar-clear-button")

		userEvent.click(screen.getByTitle("Add to Blacklist"))
		const flattenButton = (await screen.findByTestId("search-bar-exclude-button")) as HTMLButtonElement

		expect(flattenButton.disabled).toBe(true)
	})
})
