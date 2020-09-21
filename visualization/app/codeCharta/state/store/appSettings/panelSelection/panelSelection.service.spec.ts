import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { PanelSelectionAction, PanelSelectionActions } from "./panelSelection.actions"
import { PanelSelectionService } from "./panelSelection.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { PanelSelection } from "../../../../codeCharta.model"

describe("PanelSelectionService", () => {
	let panelSelectionService: PanelSelectionService
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
		panelSelectionService = new PanelSelectionService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, panelSelectionService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new panelSelection value", () => {
			const action: PanelSelectionAction = {
				type: PanelSelectionActions.SET_PANEL_SELECTION,
				payload: PanelSelection.AREA_PANEL_OPEN
			}
			storeService["store"].dispatch(action)

			panelSelectionService.onStoreChanged(PanelSelectionActions.SET_PANEL_SELECTION)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("panel-selection-changed", {
				panelSelection: PanelSelection.AREA_PANEL_OPEN
			})
		})

		it("should not notify anything on non-panel-selection-events", () => {
			panelSelectionService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
