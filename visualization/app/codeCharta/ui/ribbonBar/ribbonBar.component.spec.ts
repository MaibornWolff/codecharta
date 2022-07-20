import "./ribbonBar.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { RibbonBarController } from "./ribbonBar.component"
import { ExperimentalFeaturesEnabledService } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { addFile, setDelta, setFiles } from "../../state/store/files/files.actions"
import { METRIC_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

describe("RibbonBarController", () => {
	let ribbonBarController: RibbonBarController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.ribbonBar")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		ribbonBarController = new RibbonBarController($rootScope)
	}

	describe("constructor", () => {
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

	describe("onExperimentalFeaturesEnabledChanged", () => {
		it("should update the viewModel with the new state", () => {
			ribbonBarController.onExperimentalFeaturesEnabledChanged(true)

			expect(ribbonBarController["_viewModel"].experimentalFeaturesEnabled).toBe(true)
		})
	})

	describe("toggle", () => {
		it("should update the state with new panel selection if they differ", () => {
			ribbonBarController["_viewModel"].panelSelection = "NONE"

			ribbonBarController.updatePanelSelection("EDGE_PANEL_OPEN")

			expect(ribbonBarController["_viewModel"].panelSelection).toEqual("EDGE_PANEL_OPEN")
		})

		it("should close when calling with same mode", () => {
			ribbonBarController["_viewModel"].panelSelection = "COLOR_PANEL_OPEN"

			ribbonBarController.updatePanelSelection("COLOR_PANEL_OPEN")

			expect(ribbonBarController["_viewModel"].panelSelection).toEqual("NONE")
		})
	})

	describe("closePanelSelectionOnOutsideClick", () => {
		it("should close when clicking outside", () => {
			ribbonBarController["_viewModel"].panelSelection = "COLOR_PANEL_OPEN"
			ribbonBarController["closePanelSelectionOnOutsideClick"]({ composedPath: () => [] } as MouseEvent)
			expect(ribbonBarController["_viewModel"].panelSelection).toBe("NONE")
		})

		it("should not close when clicking inside", () => {
			ribbonBarController["_viewModel"].panelSelection = "COLOR_PANEL_OPEN"
			ribbonBarController["closePanelSelectionOnOutsideClick"]({
				composedPath: () => [{ nodeName: "CC-COLOR-SETTINGS-PANEL" }]
			} as unknown as MouseEvent)
			expect(ribbonBarController["_viewModel"].panelSelection).toBe("COLOR_PANEL_OPEN")
		})

		it("should not close when clicking on toggler", () => {
			ribbonBarController["_viewModel"].panelSelection = "COLOR_PANEL_OPEN"
			ribbonBarController["closePanelSelectionOnOutsideClick"]({
				composedPath: () => [{ title: "Show color metric settings" }]
			} as unknown as MouseEvent)
			expect(ribbonBarController["_viewModel"].panelSelection).toBe("COLOR_PANEL_OPEN")
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should detect delta mode selection", () => {
			storeService.dispatch(setFiles([]))
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
