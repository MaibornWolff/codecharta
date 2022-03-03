import "./searchPanel.module"
import { SearchPanelController } from "./searchPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { PanelSelection } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"
import { setPanelSelection } from "../../state/store/appSettings/panelSelection/panelSelection.actions"

describe("SearchPanelController", () => {
	let searchPanelModeController: SearchPanelController
	let storeService: StoreService
	let codeChartaMouseEventService: CodeChartaMouseEventService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanel")
		storeService = getService<StoreService>("storeService")
		codeChartaMouseEventService = getService<CodeChartaMouseEventService>("codeChartaMouseEventService")
	}

	function rebuildController() {
		searchPanelModeController = new SearchPanelController(codeChartaMouseEventService)
	}

	describe("constructor", () => {
		it("should be minimized initially ", () => {
			rebuildController()

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe("minimized")
		})
	})

	describe("updateSearchPanelMode", () => {
		it("should open search panel, when it was minimized before", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "minimized"

			searchPanelModeController.updateSearchPanelMode("treeView")

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual("treeView")
		})

		it("should close search panel when called with current mode", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "minimized"

			searchPanelModeController.updateSearchPanelMode("treeView")

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual("treeView")
		})

		it("should minimize all other panels", () => {
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))

			searchPanelModeController.updateSearchPanelMode("blacklist")

			expect(storeService.getState().appSettings.panelSelection).toEqual(PanelSelection.NONE)
		})
	})

	describe("openSearchPanel", () => {
		it("should keep the search panel open when it is already open", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = "treeView"

			searchPanelModeController.openSearchPanel()

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toBe("treeView")
		})
	})
})
