import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SearchPanelModeAction, SearchPanelModeActions } from "./searchPanelMode.actions"
import { SearchPanelModeService } from "./searchPanelMode.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { SearchPanelMode } from "../../../../codeCharta.model"

describe("SearchPanelModeService", () => {
	let searchPanelModeService: SearchPanelModeService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		searchPanelModeService = new SearchPanelModeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new searchPanelMode value", () => {
			const action: SearchPanelModeAction = {
				type: SearchPanelModeActions.SET_SEARCH_PANEL_MODE,
				payload: SearchPanelMode.treeView
			}
			storeService["store"].dispatch(action)

			searchPanelModeService.onStoreChanged(SearchPanelModeActions.SET_SEARCH_PANEL_MODE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("search-panel-mode-changed", { searchPanelMode: SearchPanelMode.treeView })
		})

		it("should not notify anything on non-search-panel-mode-events", () => {
			searchPanelModeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
