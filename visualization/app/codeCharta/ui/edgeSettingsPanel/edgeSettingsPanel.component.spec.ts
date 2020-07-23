import "./edgeSettingsPanel.module"
import { EdgeSettingsPanelController } from "./edgeSettingsPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { DEFAULT_STATE } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { EdgeMetricService } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { AmountOfEdgePreviewsService } from "../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.service"
import { EdgeHeightService } from "../../state/store/appSettings/edgeHeight/edgeHeight.service"
import { ShowOnlyBuildingsWithEdgesService } from "../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

describe("EdgeSettingsPanelController", () => {
	let edgeSettingsPanelController: EdgeSettingsPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let edgeMetricDataService: EdgeMetricDataService
	let codeMapActionsService: CodeMapActionsService

	beforeEach(() => {
		restartSystem()
		withMockedEdgeMetricDataService()
		withMockedCodeMapActionsService()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
	}

	function rebuildController() {
		edgeSettingsPanelController = new EdgeSettingsPanelController(
			$rootScope,
			storeService,
			edgeMetricDataService,
			codeMapActionsService
		)
	}

	function withMockedEdgeMetricDataService(amountOfAffectedBuildings = 0) {
		edgeMetricDataService.getAmountOfAffectedBuildings = jest.fn().mockReturnValue(amountOfAffectedBuildings)
	}

	function withMockedCodeMapActionsService() {
		codeMapActionsService.updateEdgePreviews = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to AmountOfEdgePreviewsService", () => {
			AmountOfEdgePreviewsService.subscribe = jest.fn()

			rebuildController()

			expect(AmountOfEdgePreviewsService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})

		it("should subscribe to EdgeHeightService", () => {
			EdgeHeightService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeHeightService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})

		it("should subscribe to ShowOnlyBuildingsWithEdgesService", () => {
			ShowOnlyBuildingsWithEdgesService.subscribe = jest.fn()

			rebuildController()

			expect(ShowOnlyBuildingsWithEdgesService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})

		it("should subscribe to EdgeMetricService", () => {
			EdgeMetricService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})
	})

	describe("onAmountOfEdgePreviewsChanged", () => {
		it("should update viewModel amountOfEdgePreviews and call codeMapActionService", () => {
			edgeSettingsPanelController.onAmountOfEdgePreviewsChanged(42)

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(42)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})
	})

	describe("onEdgeHeightChanged", () => {
		it("should update viewModel edgeHeight and call codeMapActionService", () => {
			edgeSettingsPanelController.onEdgeHeightChanged(7)

			expect(edgeSettingsPanelController["_viewModel"].edgeHeight).toBe(7)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})
	})

	describe("onShowOnlyBuildingsWithEdgesChanged", () => {
		it("should update viewModel showOnlyBuildingsWithEdges and call codeMapActionService", () => {
			edgeSettingsPanelController.onShowOnlyBuildingsWithEdgesChanged(true)

			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(true)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})
	})

	describe("onEdgeMetricChanged", () => {
		it("should get 0 totalAffectedBuildings", () => {
			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(0)
		})

		it("should get 42 totalAffectedBuildings", () => {
			withMockedEdgeMetricDataService(42)

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(42)
		})

		it("should get amountOfEdgePreviews from settings", () => {
			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(DEFAULT_STATE.appSettings.amountOfEdgePreviews)
		})

		it("should get 0 amountOfEdgePreviews and call applySettingsAmountOfEdgePreviews for metricName None", () => {
			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews = jest.fn()

			edgeSettingsPanelController.onEdgeMetricChanged("None")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(0)
			expect(edgeSettingsPanelController.applySettingsAmountOfEdgePreviews).toHaveBeenCalled()
		})

		it("should get 0 amountOfEdgePreviews and call applyShowOnlyBuildingsWithEdges for metricName None", () => {
			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges = jest.fn()

			edgeSettingsPanelController.onEdgeMetricChanged("None")

			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(false)
			expect(edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges).toHaveBeenCalled()
		})
	})

	describe("applySettingsAmountOfEdgePreviews", () => {
		it("should update amountOfEdgePreviews in store", () => {
			edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews = 42

			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews()

			expect(storeService.getState().appSettings.amountOfEdgePreviews).toBe(42)
		})
	})

	describe("applySettingsEdgeHeight", () => {
		it("should update edgeHeight in store", () => {
			edgeSettingsPanelController["_viewModel"].edgeHeight = 21

			edgeSettingsPanelController.applySettingsEdgeHeight()

			expect(storeService.getState().appSettings.edgeHeight).toBe(21)
		})
	})

	describe("applyShowOnlyBuildingsWithEdges", () => {
		it("should update showOnlyBuildingsWithEdges in store", () => {
			edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges = false

			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges()

			expect(storeService.getState().appSettings.showOnlyBuildingsWithEdges).toBeFalsy()
		})
	})
})
