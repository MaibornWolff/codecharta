import "./searchPanel.module"
import { SearchPanelController } from "./searchPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { PanelSelection, SearchPanelMode } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"
import { setSearchPanelMode } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { setPanelSelection } from "../../state/store/appSettings/panelSelection/panelSelection.actions"

describe("SearchPanelController", () => {
	let searchPanelModeController: SearchPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeChartaMouseEventService: CodeChartaMouseEventService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanel")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeChartaMouseEventService = getService<CodeChartaMouseEventService>("codeChartaMouseEventService")
	}

	function rebuildController() {
		searchPanelModeController = new SearchPanelController($rootScope, storeService, codeChartaMouseEventService)
	}

	describe("constructor", () => {
		it("should minimize the search panel and not update searchPanelMode", () => {
			rebuildController()

			expect(searchPanelModeController["_viewModel"].isExpanded).toBeFalsy()
			expect(searchPanelModeController["_viewModel"].searchPanelMode).toBeNull()
		})
	})

	describe("onSearchPanelModeChanged", () => {
		it("should minimize the search panel, but still keep the old searchPanelMode value", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = SearchPanelMode.treeView

			searchPanelModeController.onSearchPanelModeChanged(SearchPanelMode.minimized)

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.treeView)
		})

		it("should expand the search panel and update the searchPanelMode", () => {
			searchPanelModeController.onSearchPanelModeChanged(SearchPanelMode.flatten)

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.flatten)
		})
	})

	describe("toggle", () => {
		it("should switch to treeView if minimized", () => {
			searchPanelModeController["_viewModel"].isExpanded = false

			searchPanelModeController.toggle()

			expect(storeService.getState().appSettings.searchPanelMode).toEqual(SearchPanelMode.treeView)
		})

		it("should minimize when search panel is expanded", () => {
			searchPanelModeController["_viewModel"].isExpanded = true

			searchPanelModeController.toggle()

			expect(storeService.getState().appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
		})

		it("should minimize all other panels except the search panel", () => {
			storeService.dispatch(setSearchPanelMode(SearchPanelMode.treeView))
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))

			searchPanelModeController.toggle()

			const { appSettings } = storeService.getState()

			expect(appSettings.searchPanelMode).toEqual(SearchPanelMode.treeView)
			expect(appSettings.panelSelection).toEqual(PanelSelection.NONE)
		})
	})

	describe("openSearchPanel", () => {
		it("should open the search panel", () => {
			searchPanelModeController["_viewModel"].isExpanded = false

			searchPanelModeController.openSearchPanel()

			expect(storeService.getState().appSettings.searchPanelMode).toEqual(SearchPanelMode.treeView)
		})
	})
})
