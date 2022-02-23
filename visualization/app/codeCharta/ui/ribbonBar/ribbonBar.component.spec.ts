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
import { addFile, resetFiles, setDelta } from "../../state/store/files/files.actions"
import { METRIC_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

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
		it("should subscribe to PanelSelectionService", () => {
			PanelSelectionService.subscribe = jest.fn()

			rebuildController()

			expect(PanelSelectionService.subscribe).toHaveBeenCalledWith($rootScope, ribbonBarController)
		})

		it("should subscribe to ExperimentalFeaturesEnabledService", () => {
			ExperimentalFeaturesEnabledService.subscribe = jest.fn()

			rebuildController()

			expect(ExperimentalFeaturesEnabledService.subscribe).toHaveBeenCalledWith($rootScope, ribbonBarController)
		})

		it("should subscribe to EdgeMetricDataService", () => {
			EdgeMetricDataService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeMetricDataService.subscribe).toHaveBeenCalledWith($rootScope, ribbonBarController)
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
			storeService.dispatch(setSearchPanelMode(SearchPanelMode.blacklist))
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))

			ribbonBarController.toggle(PanelSelection.COLOR_PANEL_OPEN)

			const { appSettings } = storeService.getState()

			expect(appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
			expect(appSettings.panelSelection).toEqual(PanelSelection.COLOR_PANEL_OPEN)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should detect delta mode selection", () => {
			storeService.dispatch(resetFiles())
			storeService.dispatch(addFile(TEST_DELTA_MAP_A))
			storeService.dispatch(addFile(TEST_DELTA_MAP_B))
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))
			ribbonBarController.onFilesSelectionChanged(storeService.getState().files)

			expect(ribbonBarController["_viewModel"].files).toEqual(storeService.getState().files)
			expect(ribbonBarController["_viewModel"].isDeltaState).toEqual(true)
		})
	})

	describe("onEdgeMetricDataChanged", () => {
		it("should detect if data has edge metrics", () => {
			ribbonBarController.onEdgeMetricDataChanged([])
			expect(ribbonBarController["_viewModel"].hasEdgeMetric).toBe(false)

			ribbonBarController.onEdgeMetricDataChanged(METRIC_DATA)
			expect(ribbonBarController["_viewModel"].hasEdgeMetric).toBe(true)
		})
	})
})
