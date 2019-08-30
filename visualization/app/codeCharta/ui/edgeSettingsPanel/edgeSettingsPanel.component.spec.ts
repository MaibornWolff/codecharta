import "./edgeSettingsPanel.module"
import { EdgeSettingsPanelController } from "./edgeSettingsPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { DEFAULT_SETTINGS } from "../../util/dataMocks"
import _ from "lodash"
import { Settings } from "../../codeCharta.model"

describe("EdgeSettingsPanelController", () => {
	let edgeSettingsPanelController: EdgeSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let edgeMetricService: EdgeMetricService
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
		edgeMetricService = getService<EdgeMetricService>("edgeMetricService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")

		settings = _.cloneDeep(DEFAULT_SETTINGS)
	}

	function rebuildController() {
		edgeSettingsPanelController = new EdgeSettingsPanelController($rootScope, settingsService, edgeMetricService, codeMapActionsService)
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

	function withMockedEdgeMetricService(amountOfAffectedBuildings: number) {
		edgeMetricService = edgeSettingsPanelController["edgeMetricService"] = jest.fn<EdgeMetricService>(() => {
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
		it("should get 0 totalAffectedBuildings", () => {
			rebuildController()
			withMockedEdgeMetricService(0)

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(0)
		})

		it("should get 42 totalAffectedBuildings", () => {
			rebuildController()
			withMockedEdgeMetricService(42)

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].totalAffectedBuildings).toBe(42)
		})

		it("should get amountOfEdgePreviews from settings", () => {
			rebuildController()
			withMockedEdgeMetricService(0)

			edgeSettingsPanelController.onEdgeMetricChanged("anyMetricName")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(settings.appSettings.amountOfEdgePreviews)
		})

		it("should get 0 amountOfEdgePreviews for metricName None", () => {
			rebuildController()
			withMockedEdgeMetricService(0)

			edgeSettingsPanelController.onEdgeMetricChanged("None")

			expect(edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews).toBe(0)
		})
	})

	describe("applySettingsAmountOfEdgePreviews", () => {
		it("should call updateSettings", () => {
			rebuildController()
			edgeSettingsPanelController["_viewModel"].amountOfEdgePreviews = 42

			edgeSettingsPanelController.applySettingsAmountOfEdgePreviews()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { amountOfEdgePreviews: 42 } })
		})
	})

	describe("applySettingsEdgeHeight", () => {
		it("should call updateSettings", () => {
			rebuildController()
			edgeSettingsPanelController["_viewModel"].edgeHeight = 21

			edgeSettingsPanelController.applySettingsEdgeHeight()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { edgeHeight: 21 } })
		})
	})

	describe("applyShowOnlyBuildingsWithEdges", () => {
		it("should call updateSettings", () => {
			rebuildController()
			edgeSettingsPanelController["_viewModel"].showOnlyBuildingsWithEdges = false

			edgeSettingsPanelController.applyShowOnlyBuildingsWithEdges()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { showOnlyBuildingsWithEdges: false } })
		})
	})
})
