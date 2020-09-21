import "./codeCharta.module"
import { CodeChartaMouseEventService } from "./codeCharta.mouseEvent.service"
import { StoreService } from "./state/store.service"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { setPanelSelection } from "./state/store/appSettings/panelSelection/panelSelection.actions"
import { PanelSelection, SearchPanelMode } from "./codeCharta.model"
import { setSearchPanelMode } from "./state/store/appSettings/searchPanelMode/searchPanelMode.actions"

describe("CodeChartaMouseEventService", () => {
	let codeChartaMouseEventService: CodeChartaMouseEventService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		codeChartaMouseEventService = new CodeChartaMouseEventService(storeService)
	}

	describe("closeComponentsExceptCurrent", () => {
		it("should execute all close calls for listed components", () => {
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))
			storeService.dispatch(setSearchPanelMode(SearchPanelMode.treeView))

			codeChartaMouseEventService.closeComponentsExceptCurrent()

			const { appSettings } = storeService.getState()

			expect(appSettings.panelSelection).toEqual(PanelSelection.NONE)
			expect(appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
		})

		it("should execute all close calls except one for listed components", () => {
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))
			storeService.dispatch(setSearchPanelMode(SearchPanelMode.treeView))

			codeChartaMouseEventService.closeComponentsExceptCurrent(codeChartaMouseEventService.closeSearchPanel)

			const { appSettings } = storeService.getState()

			expect(appSettings.panelSelection).toEqual(PanelSelection.NONE)
			expect(appSettings.searchPanelMode).toEqual(SearchPanelMode.treeView)
		})
	})
})
