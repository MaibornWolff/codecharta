import { searchPanelMode } from "./searchPanelMode.reducer"
import { SearchPanelModeAction, setSearchPanelMode } from "./searchPanelMode.actions"
import { SearchPanelMode } from "../../../../codeCharta.model"

describe("searchPanelMode", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = searchPanelMode(undefined, {} as SearchPanelModeAction)

			expect(result).toEqual(SearchPanelMode.minimized)
		})
	})

	describe("Action: SET_SEARCH_PANEL_MODE", () => {
		it("should set new searchPanelMode", () => {
			const result = searchPanelMode(SearchPanelMode.minimized, setSearchPanelMode(SearchPanelMode.treeView))

			expect(result).toEqual(SearchPanelMode.treeView)
		})

		it("should set default searchPanelMode", () => {
			const result = searchPanelMode(SearchPanelMode.treeView, setSearchPanelMode())

			expect(result).toEqual(SearchPanelMode.minimized)
		})
	})
})
