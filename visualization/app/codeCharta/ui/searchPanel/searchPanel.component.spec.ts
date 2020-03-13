import "./searchPanel.module"
import { SearchPanelController } from "./searchPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SearchPanelMode } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"

describe("SearchPanelController", () => {
	let searchPanelModeController: SearchPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanel")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		searchPanelModeController = new SearchPanelController($rootScope, storeService)
	}

	describe("onSearchPanelModeChanged", () => {
		it("should set searchPanelMode correctly", () => {
			let searchPanelMode = SearchPanelMode.treeView

			searchPanelModeController.onSearchPanelModeChanged(searchPanelMode)

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.treeView)
		})

		it("should set searchPanelMode to minimized", () => {
			let searchPanelMode = SearchPanelMode.minimized

			searchPanelModeController.onSearchPanelModeChanged(searchPanelMode)

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.minimized)
		})
	})

	describe("toggle", () => {
		it("should switch to treeView if minimized", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = SearchPanelMode.minimized

			searchPanelModeController.toggle()

			expect(storeService.getState().appSettings.searchPanelMode).toEqual(SearchPanelMode.treeView)
		})

		it("should minimize when opened & clicked", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = SearchPanelMode.flatten

			searchPanelModeController.toggle()

			expect(storeService.getState().appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
		})
	})
})
