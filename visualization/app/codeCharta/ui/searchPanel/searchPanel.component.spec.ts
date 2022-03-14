import { TestBed } from "@angular/core/testing"
import { fireEvent, render, RenderResult } from "@testing-library/angular"
import { SearchPanelComponent } from "./searchPanel.component"
import { SearchPanelModule } from "./searchPanel.module"

describe("SearchPanelComponent", () => {
	// outside close

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SearchPanelModule]
		})
	})

	it("should be minimized initially", async () => {
		const { container } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
		expect(isSearchPanelOpen(container)).toBe(false)
		expect(getBodyElementsHidden(container)).toEqual({
			blackListPanel: true,
			matchingFilesCounter: true,
			mapTreeView: true
		})
	})

	it("should open when clicked on search bar", async () => {
		const { container } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
		fireEvent.click(container.querySelector("cc-search-bar"))
		expect(isSearchPanelOpen(container)).toBe(true)
		expect(getBodyElementsHidden(container)).toEqual({
			blackListPanel: true,
			matchingFilesCounter: false,
			mapTreeView: false
		})
	})

	it("should close, when clicking on opened mode", async () => {
		const { container, getByText } = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
		fireEvent.click(container.querySelector("cc-search-bar"))
		fireEvent.click(getByText("File/Node Explorer"))
		expect(isSearchPanelOpen(container)).toBe(false)
		expect(getBodyElementsHidden(container)).toEqual({
			blackListPanel: true,
			matchingFilesCounter: true,
			mapTreeView: true
		})
	})

	describe("closing on outside clicks", () => {
		let renderResult: RenderResult<SearchPanelComponent, SearchPanelComponent>

		beforeEach(async () => {
			renderResult = await render(SearchPanelComponent, { excludeComponentDeclaration: true })
			fireEvent.click(renderResult.container.querySelector("cc-search-bar"))
		})

		it("should close on outside click", async () => {
			expect(isSearchPanelOpen(renderResult.container)).toBe(true)
			fireEvent.mouseDown(document)
			expect(isSearchPanelOpen(renderResult.container)).toBe(false)
		})

		it("should not close when clicking inside", () => {
			renderResult.container.querySelector("cc-map-tree-view")["click"]()
			// fireEvent.mouseDown(renderResult.container.querySelector("cc-map-tree-view"))
			expect(isSearchPanelOpen(renderResult.container)).toBe(true)
		})
	})
})

function isSearchPanelOpen(container: Element) {
	return container.querySelector("mat-card").classList.contains("expanded")
}

function getBodyElementsHidden(container: Element) {
	return {
		blackListPanel: container.querySelector("cc-blacklist-panel")["hidden"],
		matchingFilesCounter: container.querySelector("cc-matching-files-counter")["hidden"],
		mapTreeView: container.querySelector("cc-map-tree-view")["hidden"]
	}
}
