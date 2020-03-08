import "./searchPanelModeSelector.module"
import { SearchPanelModeSelectorController } from "./searchPanelModeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SearchPanelMode, BlacklistType } from "../../codeCharta.model"
import { SearchPatternService } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "../../state/store.service"
import { SearchPanelModeService } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.service"

describe("SearchPanelModeSelectorController", () => {
	let searchPanelModeSelectorController: SearchPanelModeSelectorController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanelModeSelector")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		searchPanelModeSelectorController = new SearchPanelModeSelectorController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to Search-Pattern-Event", () => {
			SearchPatternService.subscribe = jest.fn()

			rebuildController()

			expect(SearchPatternService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})

		it("should subscribe to Blacklist-Event", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})

		it("should subscribe to SearchPanelService", () => {
			SearchPanelModeService.subscribe = jest.fn()

			rebuildController()

			expect(SearchPanelModeService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
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

			expect(storeService.getState().appSettings.searchPanelMode).toEqual(SearchPanelMode.treeView)
		})

		it("should unselect if already selected", () => {
			searchPanelModeSelectorController["_viewModel"].searchPanelMode = SearchPanelMode.treeView

			searchPanelModeSelectorController.onToggleSearchPanelMode(SearchPanelMode.treeView)

			expect(storeService.getState().appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
		})
	})
})
