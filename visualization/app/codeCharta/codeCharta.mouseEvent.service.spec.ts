import "./codeCharta.module"
import { CodeChartaMouseEventService } from "./codeCharta.mouseEvent.service"
import { StoreService } from "./state/store.service"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { setPanelSelection } from "./state/store/appSettings/panelSelection/panelSelection.actions"
import { PanelSelection } from "./codeCharta.model"

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

			codeChartaMouseEventService.closeComponentsExceptCurrent()

			const { appSettings } = storeService.getState()

			expect(appSettings.panelSelection).toEqual(PanelSelection.NONE)
		})
	})
})
