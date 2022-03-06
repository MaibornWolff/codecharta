import "./searchPanel.module"
import { SearchPanelController } from "./searchPanel.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("SearchPanelController", () => {
	let searchPanelModeController: SearchPanelController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanel")
	}

	function rebuildController() {
		searchPanelModeController = new SearchPanelController()
	}

	describe("constructor", () => {
		it("should be minimized initially ", () => {
			rebuildController()

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe("minimized")
		})
	})

	describe("updateSearchPanelMode", () => {
		it("should open search panel, when it was minimized before", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "minimized"

			searchPanelModeController.updateSearchPanelMode("treeView")

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual("treeView")
		})

		it("should close search panel when called with current mode", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "minimized"

			searchPanelModeController.updateSearchPanelMode("blacklist")

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual("blacklist")
		})
	})

	describe("openSearchPanel", () => {
		it("should keep the search panel open when it is already open", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "treeView"

			searchPanelModeController.openSearchPanel()

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe("treeView")
		})
	})

	describe("closeSearchPanelOnOutsideClick", () => {
		it("should close when clicked outside", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "treeView"
			searchPanelModeController["closeSearchPanelOnOutsideClick"]({ composedPath: () => [] } as MouseEvent)
			expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe("minimized")
		})

		it("should not close when context menu within search panel was opened", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "treeView"
			searchPanelModeController["closeSearchPanelOnOutsideClick"]({
				composedPath: () => [{ id: "codemap-context-menu" }]
			} as unknown as MouseEvent)
			expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe("treeView")
		})
	})
})
