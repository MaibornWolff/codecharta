import "./state.module"
import { SearchPanelService } from "./searchPanel.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SearchPanelMode } from "../codeCharta.model"

describe("SearchPanelService", () => {
	let searchPanelService: SearchPanelService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		searchPanelService = new SearchPanelService($rootScope)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("updateSearchPanelMode", () => {
		it("should set search panel Mode to new value", () => {
			searchPanelService.updateSearchPanelMode(SearchPanelMode.minimized)

			expect(searchPanelService["searchPanelMode"]).toEqual(SearchPanelMode.minimized)
		})

		it("should broadcast SEARCH_PANEL_MODE_EVENT", () => {
			searchPanelService.updateSearchPanelMode(SearchPanelMode.minimized)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("search-panel-mode-changed", SearchPanelMode.minimized)
		})
	})
})
