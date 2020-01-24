import "./searchPanel.module"
import { SearchPanelController } from "./searchPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { SearchPanelMode } from "../../model/codeCharta.model"
import { SearchPanelService } from "../../state/searchPanel.service"

describe("SearchPanelController", () => {
	let searchPanelModeController: SearchPanelController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let searchPanelService: SearchPanelService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanel")
		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
		searchPanelService = getService<SearchPanelService>("searchPanelService")
	}

	function rebuildController() {
		searchPanelModeController = new SearchPanelController($rootScope, $timeout, searchPanelService)
	}

	function withMockedSearchPanelService() {
		searchPanelService = searchPanelModeController["searchPanelService"] = jest.fn(() => {
			return {
				updateSearchPanelMode: jest.fn()
			}
		})()
	}

	describe("Show components selected", () => {
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
		beforeEach(() => {
			withMockedSearchPanelService()
		})

		it("should switch to treeView if minimized", () => {
			searchPanelModeController.toggle()

			expect(searchPanelService.updateSearchPanelMode).toBeCalledWith(SearchPanelMode.treeView)
		})

		it("should minimize when opened & clicked", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = SearchPanelMode.flatten

			searchPanelModeController.toggle()

			expect(searchPanelService.updateSearchPanelMode).toBeCalledWith(SearchPanelMode.minimized)
		})
	})
})
