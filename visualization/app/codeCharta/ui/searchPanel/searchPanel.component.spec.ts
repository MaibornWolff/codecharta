import { TestBed } from "@angular/core/testing"
import { fireEvent, render } from "@testing-library/angular"
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
