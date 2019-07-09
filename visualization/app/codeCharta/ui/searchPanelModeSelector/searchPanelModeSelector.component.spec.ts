import "./searchPanelModeSelector.module"
import { SearchPanelModeSelectorController } from "./searchPanelModeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { SETTINGS } from "../../util/dataMocks"
import { SearchPanelMode, BlacklistType } from "../../codeCharta.model"

describe("SearchPanelModeSelectorController", () => {
	let searchPanelModeSelectorController: SearchPanelModeSelectorController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanelModeSelector")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		searchPanelModeSelectorController = new SearchPanelModeSelectorController(settingsService, $rootScope)
	}

	function withMockedSettingsService() {
		settingsService = searchPanelModeSelectorController["settingsService"] = jest.fn().mockReturnValue({
			updateSettings: jest.fn()
		})()
	}

	describe("onSettingsChanged", () => {
		it("should update searchPanelMode", () => {
			SETTINGS.dynamicSettings.searchPanelMode = SearchPanelMode.hide

			searchPanelModeSelectorController.onSettingsChanged(SETTINGS, null, null)

			expect(searchPanelModeSelectorController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.hide)
		})

		it("should update counters", () => {
			let blacklistItem1 = { path: "/root", type: BlacklistType.hide }
			let blacklistItem2 = { path: "/root/foo", type: BlacklistType.exclude }
			let blacklistItem3 = { path: "/root/bar", type: BlacklistType.exclude }
			let blacklist = [blacklistItem1, blacklistItem2, blacklistItem3]
			SETTINGS.fileSettings.blacklist = blacklist

			searchPanelModeSelectorController.onSettingsChanged(SETTINGS, null, null)

			expect(searchPanelModeSelectorController["_viewModel"].hideListLength).toEqual(1)
			expect(searchPanelModeSelectorController["_viewModel"].excludeListLength).toEqual(2)
		})
	})

	describe("onToggleSearchPanelMode", () => {
		it("should select if not already selected", () => {
			searchPanelModeSelectorController.onToggleSearchPanelMode(SearchPanelMode.treeView)

			expect(settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { searchPanelMode: SearchPanelMode.treeView } })
		})

		it("should unselect if already selected", () => {
			searchPanelModeSelectorController.onToggleSearchPanelMode(SearchPanelMode.treeView)

			searchPanelModeSelectorController.onToggleSearchPanelMode(SearchPanelMode.treeView)

			expect(settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { searchPanelMode: SearchPanelMode.minimized } })
		})
	})
})
