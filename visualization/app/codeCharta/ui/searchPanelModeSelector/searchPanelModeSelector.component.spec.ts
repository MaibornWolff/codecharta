import "./searchPanelModeSelector.module"
import { SearchPanelModeSelectorController } from "./searchPanelModeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SearchPanelMode, BlacklistType } from "../../codeCharta.model"
import { SearchPanelService } from "../../state/searchPanel.service"
import { SettingsService } from "../../state/settings.service"

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

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribeToSearchPattern = jest.fn()
			SettingsService.subscribeToBlacklist = jest.fn()
			SearchPanelService.subscribe = jest.fn()
		})

		it("should subscribe to Search-Pattern-Event", () => {
			rebuildController()

			expect(SettingsService.subscribeToSearchPattern).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})

		it("should subscribe to Blacklist-Event", () => {
			rebuildController()

			expect(SettingsService.subscribeToBlacklist).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})

		it("should subscribe to SearchPanelService", () => {
			rebuildController()

			expect(SearchPanelService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})
	})

	describe("onSearchPanelModeChanged", () => {
		it("should update searchPanelMode", () => {
			let searchPanelMode = SearchPanelMode.hide

			searchPanelModeSelectorController.onSearchPanelModeChanged(searchPanelMode)

			expect(searchPanelModeSelectorController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.hide)
		})
	})

	describe("onSearchPatternChanged", () => {
		it("should set searchFieldIsEmpty in viewModel", () => {
			searchPanelModeSelectorController["_viewModel"].searchFieldIsEmpty = false

			searchPanelModeSelectorController.onSearchPatternChanged("")

			expect(searchPanelModeSelectorController["_viewModel"].searchFieldIsEmpty).toBeTruthy()
		})
	})

	describe("onBlacklistChanged", () => {
		it("should update counters", () => {
			const blacklist = [
				{ path: "/root", type: BlacklistType.hide },
				{
					path: "/root/foo",
					type: BlacklistType.exclude
				},
				{ path: "/root/bar", type: BlacklistType.exclude }
			]

			searchPanelModeSelectorController.onBlacklistChanged(blacklist)

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
