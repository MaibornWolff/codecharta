import "./searchPanelModeSelector.module"
import { SearchPanelModeSelectorController } from "./searchPanelModeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SETTINGS } from "../../util/dataMocks"
import { SearchPanelMode, BlacklistType } from "../../codeCharta.model"
import { SearchPanelService } from "../../state/searchPanel.service"

describe("SearchPanelModeSelectorController", () => {
	let searchPanelModeSelectorController: SearchPanelModeSelectorController
	let $rootScope: IRootScopeService
	let searchPanelService: SearchPanelService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanelModeSelector")

		$rootScope = getService<IRootScopeService>("$rootScope")
		searchPanelService = getService<SearchPanelService>("settingsService")
	}

	function rebuildController() {
		searchPanelModeSelectorController = new SearchPanelModeSelectorController(searchPanelService, $rootScope)
	}

	function withMockedSettingsService() {
		searchPanelService = searchPanelModeSelectorController["searchPanelService"] = jest.fn().mockReturnValue({
			updateSearchPanelMode: jest.fn()
		})()
	}

	describe("onSearchPanelModeChanged", () => {
		it("should update searchPanelMode", () => {
			let searchPanelMode = SearchPanelMode.hide

			searchPanelModeSelectorController.onSearchPanelModeChanged(searchPanelMode)

			expect(searchPanelModeSelectorController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.hide)
		})
	})

	describe("onSettingsChanged", () => {
		it("should update counters", () => {
			let blacklistItem1 = { path: "/root", type: BlacklistType.hide }
			let blacklistItem2 = { path: "/root/foo", type: BlacklistType.exclude }
			let blacklistItem3 = { path: "/root/bar", type: BlacklistType.exclude }
			let blacklist = [blacklistItem1, blacklistItem2, blacklistItem3]
			SETTINGS.fileSettings.blacklist = blacklist

			searchPanelModeSelectorController.onSettingsChanged(SETTINGS, null)

			expect(searchPanelModeSelectorController["_viewModel"].hideListLength).toEqual(1)
			expect(searchPanelModeSelectorController["_viewModel"].excludeListLength).toEqual(2)
		})
	})

	describe("onToggleSearchPanelMode", () => {
		it("should select if not already selected", () => {
			searchPanelModeSelectorController.onToggleSearchPanelMode(SearchPanelMode.treeView)

			expect(searchPanelService.updateSearchPanelMode).toBeCalledWith(SearchPanelMode.treeView)
		})

		it("should unselect if already selected", () => {
			searchPanelModeSelectorController.onToggleSearchPanelMode(SearchPanelMode.treeView)

			searchPanelModeSelectorController.onToggleSearchPanelMode(SearchPanelMode.treeView)

			expect(searchPanelService.updateSearchPanelMode).toBeCalledWith(SearchPanelMode.minimized)
		})
	})
})
