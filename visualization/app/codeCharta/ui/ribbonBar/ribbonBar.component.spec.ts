import "./ribbonBar.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { PanelSelection, SearchPanelMode } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"
import { setSearchPanelMode } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { setPanelSelection } from "../../state/store/appSettings/panelSelection/panelSelection.actions"
import { RibbonBarController } from "./ribbonBar.component"
import { PanelSelectionService } from "../../state/store/appSettings/panelSelection/panelSelection.service"
import { ExperimentalFeaturesEnabledService } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"

describe("RibbonBarController", () => {
	let ribbonBarController: RibbonBarController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeChartaMouseEventService: CodeChartaMouseEventService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.ribbonBar")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeChartaMouseEventService = getService<CodeChartaMouseEventService>("codeChartaMouseEventService")
	}

	function rebuildController() {
		ribbonBarController = new RibbonBarController(storeService, $rootScope, codeChartaMouseEventService)
	}

	describe("constructor", () => {
		it("should subscripe to PanelSelectionService", () => {
			PanelSelectionService.subscribe = jest.fn()

			rebuildController()

			expect(PanelSelectionService.subscribe).toHaveBeenCalledWith($rootScope, ribbonBarController)
		})

		it("should subscripe to ExperimentalFeaturesEnabledService", () => {
			ExperimentalFeaturesEnabledService.subscribe = jest.fn()

			rebuildController()

			expect(ExperimentalFeaturesEnabledService.subscribe).toHaveBeenCalledWith($rootScope, ribbonBarController)
		})
	})

	describe("onPanelSelectionChanged", () => {
		it("should update the viewModel with the new panel selection", () => {
			ribbonBarController.onPanelSelectionChanged(PanelSelection.HEIGHT_PANEL_OPEN)

			expect(ribbonBarController["_viewModel"].panelSelection).toEqual(PanelSelection.HEIGHT_PANEL_OPEN)
		})
	})

	describe("onExperimentalFeaturesEnabledChanged", () => {
		it("should update the viewModel with the new state", () => {
			ribbonBarController.onExperimentalFeaturesEnabledChanged(true)

			expect(ribbonBarController["_viewModel"].experimentalFeaturesEnabled).toBe(true)
		})
	})

	describe("toggle", () => {
		it("update the state with the new panel selection if the differ", () => {
			storeService.dispatch(setPanelSelection(PanelSelection.NONE))

			ribbonBarController.toggle(PanelSelection.EDGE_PANEL_OPEN)

			expect(storeService.getState().appSettings.panelSelection).toEqual(PanelSelection.EDGE_PANEL_OPEN)
		})

		it("update the state with the panel selection being closed, if the toggle closes it", () => {
			storeService.dispatch(setPanelSelection(PanelSelection.COLOR_PANEL_OPEN))

			ribbonBarController.toggle(PanelSelection.NONE)

			expect(storeService.getState().appSettings.panelSelection).toEqual(PanelSelection.NONE)
		})

		it("should minimize all other panels except the ribbon bar panels", () => {
			storeService.dispatch(setSearchPanelMode(SearchPanelMode.exclude))
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))

			ribbonBarController.toggle(PanelSelection.COLOR_PANEL_OPEN)

			const { appSettings } = storeService.getState()

			expect(appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
			expect(appSettings.panelSelection).toEqual(PanelSelection.COLOR_PANEL_OPEN)
		})
	})
})
