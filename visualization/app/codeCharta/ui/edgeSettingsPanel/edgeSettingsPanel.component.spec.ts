import "./edgeSettingsPanel.module"
import { EdgeSettingsPanelController } from "./edgeSettingsPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { DEFAULT_SETTINGS } from "../../util/dataMocks"
import _ from "lodash"
import { Settings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"

describe("EdgeSettingsPanelController", () => {
	let edgeSettingsPanelController: EdgeSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService
	let edgeMetricDataService: EdgeMetricDataService
	let codeMapActionsService: CodeMapActionsService

	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")

		settings = _.cloneDeep(DEFAULT_SETTINGS)
	}

	function rebuildController() {
		edgeSettingsPanelController = new EdgeSettingsPanelController(
			$rootScope,
			settingsService,
			storeService,
			edgeMetricDataService,
			codeMapActionsService
		)
	}

	function withMockedEvents() {
		SettingsService.subscribe = jest.fn()
		SettingsService.subscribeToEdgeMetric = jest.fn()
	}

	function withMockedSettingsService() {
		settingsService = edgeSettingsPanelController["settingsService"] = jest.fn<SettingsService>(() => {
			return {
				getDefaultSettings: jest.fn().mockReturnValue(settings),
				updateSettings: jest.fn()
			}
		})()
	}

	function withMockedEdgeMetricDataService(amountOfAffectedBuildings: number = 0) {
		edgeMetricDataService = edgeSettingsPanelController["edgeMetricDataService"] = jest.fn<EdgeMetricDataService>(() => {
			return {
				getAmountOfAffectedBuildings: jest.fn().mockReturnValue(amountOfAffectedBuildings)
			}
		})()
	}

	function withMockedCodeMapActionsService() {
		codeMapActionsService = edgeSettingsPanelController["codeMapActionsService"] = jest.fn<CodeMapActionsService>(() => {
			return {
				updateEdgePreviews: jest.fn()
			}
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			withMockedEvents()
		})

		it("should subscribe to SettingsService", () => {
			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})

		it("should subscribe to EdgeMetric-Events", () => {
			rebuildController()

			expect(SettingsService.subscribeToEdgeMetric).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})
	})

	describe("onSettingsChanged", () => {
		beforeEach(() => {
			withMockedCodeMapActionsService()
		})

		it("should update viewModel amountOfEdgePreviews and call codeMapActionService", () => {
			rebuildController()
			const update = { appSettings: { amountOfEdgePreviews: 42 } }

			edgeSettingsPanelController.onSettingsChanged(settings, update)

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(42)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})

		it("should update viewModel edgeHeight and call codeMapActionService", () => {
			rebuildController()
			const update = { appSettings: { edgeHeight: 7 } }

			edgeSettingsPanelController.onSettingsChanged(settings, update)

			expect(edgeSettingsPanelController["_viewModel"].edgeHeight).toBe(7)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})

		it("should update viewModel showOnlyBuildingsWithEdges and call codeMapActionService", () => {
			rebuildController()
			const update = { appSettings: { showOnlyBuildingsWithEdges: true } }

			edgeSettingsPanelController.onSettingsChanged(settings, update)

			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(true)
			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})

		it("should not update viewModel and not call codeMapActionService", () => {
			rebuildController()
			const update: Settings = ({ appSettings: { otherSettings: true } } as any) as Settings
			edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews = 42
			edgeSettingsPanelController["_viewModel"].edgeHeight = 7
			edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges = true

			edgeSettingsPanelController.onSettingsChanged(settings, update)

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(42)
			expect(edgeSettingsPanelController["_viewModel"].edgeHeight).toBe(7)
			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(true)
			expect(codeMapActionsService.updateEdgePreviews).not.toHaveBeenCalled()
		})
	})

	describe("onEdgeMetricChanged", () => {
		beforeEach(() => {
			withMockedEdgeMetricDataService()
		})
		it("should get 0 totalAffectedBuildings", () => {
			rebuildController()

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(0)
		})

		it("should get 42 totalAffectedBuildings", () => {
			rebuildController()
			withMockedEdgeMetricDataService(42)

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(42)
		})

		it("should get amountOfEdgePreviews from settings", () => {
			rebuildController()

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(settings.appSettings.amountOfEdgePreviews)
		})

		it("should get 0 amountOfEdgePreviews and call applySettingsAmountOfEdgePreviews for metricName None", () => {
			rebuildController()
			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews = jest.fn()

			edgeSettingsPanelController.onEdgeMetricChanged("None")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(0)
			expect(edgeSettingsPanelController.applySettingsAmountOfEdgePreviews).toHaveBeenCalled()
		})

		it("should get 0 amountOfEdgePreviews and call applyShowOnlyBuildingsWithEdges for metricName None", () => {
			rebuildController()
			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges = jest.fn()

			edgeSettingsPanelController.onEdgeMetricChanged("None")

			expect(edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges).toBe(false)
			expect(edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges).toHaveBeenCalled()
		})
	})

	describe("applySettingsAmountOfEdgePreviews", () => {
		it("should call updateSettings", () => {
			rebuildController()
			edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews = 42

			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { amountOfEdgePreviews: 42 } })
			expect(storeService.getState().appSettings.amountOfEdgePreviews).toEqual(42)
		})
	})

	describe("applySettingsEdgeHeight", () => {
		it("should call updateSettings", () => {
			rebuildController()
			edgeSettingsPanelController["_viewModel"].edgeHeight = 21

			edgeSettingsPanelController.applySettingsEdgeHeight()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { edgeHeight: 21 } })
			expect(storeService.getState().appSettings.edgeHeight).toEqual(21)
		})
	})

	describe("applyShowOnlyBuildingsWithEdges", () => {
		it("should call updateSettings", () => {
			rebuildController()
			edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges = false

			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { showOnlyBuildingsWithEdges: false } })
			expect(storeService.getState().appSettings.showOnlyBuildingsWithEdges).toBeFalsy()
		})
	})
})
