import "./searchPanelModeSelector.module"
import { SearchPanelModeSelectorController } from "./searchPanelModeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SearchPanelMode, BlacklistType } from "../../model/codeCharta.model"
import { SearchPanelService } from "../../state/searchPanel.service"
import { SearchPatternService } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

describe("SearchPanelModeSelectorController", () => {
	let searchPanelModeSelectorController: SearchPanelModeSelectorController
	let $rootScope: IRootScopeService
	let searchPanelService: SearchPanelService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSearchPanelService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanelModeSelector")

		$rootScope = getService<IRootScopeService>("$rootScope")
		searchPanelService = getService<SearchPanelService>("searchPanelService")
	}

	function rebuildController() {
		searchPanelModeSelectorController = new SearchPanelModeSelectorController($rootScope, searchPanelService)
	}

	function withMockedSearchPanelService() {
		searchPanelService = searchPanelModeSelectorController["searchPanelService"] = jest.fn().mockReturnValue({
			updateSearchPanelMode: jest.fn()
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			SearchPatternService.subscribe = jest.fn()
			BlacklistService.subscribe = jest.fn()
			SearchPanelService.subscribe = jest.fn()
		})

		it("should subscribe to Search-Pattern-Event", () => {
			rebuildController()

			expect(SearchPatternService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})

		it("should subscribe to Blacklist-Event", () => {
			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})

		it("should subscribe to SearchPanelService", () => {
			rebuildController()

			expect(SearchPanelService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})
	})

	describe("onSearchPanelModeChanged", () => {
		it("should update searchPanelMode", () => {
			const searchPanelMode = SearchPanelMode.flatten

			searchPanelModeSelectorController.onSearchPanelModeChanged(searchPanelMode)

			expect(searchPanelModeSelectorController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.flatten)
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
				{ path: "/root", type: BlacklistType.flatten },
				{
					path: "/root/foo",
					type: BlacklistType.exclude
				},
				{ path: "/root/bar", type: BlacklistType.exclude }
			]

			searchPanelModeSelectorController.onBlacklistChanged(blacklist)

			expect(searchPanelModeSelectorController["_viewModel"].flattenListLength).toEqual(1)
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
