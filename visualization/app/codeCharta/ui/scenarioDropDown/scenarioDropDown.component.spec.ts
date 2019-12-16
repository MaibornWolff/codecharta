import "./scenarioDropDown.module"
import "../codeMap/threeViewer/threeViewer.module"
import { ScenarioDropDownController } from "./scenarioDropDown.component"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MetricService } from "../../state/metric.service"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { MetricData } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"

describe("ScenarioDropDownController", () => {
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let scenarioButtonsController: ScenarioDropDownController
	let metricData: MetricData[]

	function rebuildController() {
		scenarioButtonsController = new ScenarioDropDownController($rootScope, settingsService, storeService, threeOrbitControlsService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.scenarioDropDown")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")

		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
	}

	function withMockedSettingsService() {
		settingsService = scenarioButtonsController["settingsService"] = jest.fn(() => {
			return {
				updateSettings: jest.fn()
			}
		})()
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = scenarioButtonsController["threeOrbitControlsService"] = jest.fn(() => {
			return {
				autoFitTo: jest.fn()
			}
		})()
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
		withMockedThreeOrbitControlsService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("constructor", () => {
		it("should subscribe to MetricService on construction", () => {
			MetricService.subscribe = jest.fn()

			rebuildController()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, scenarioButtonsController)
		})
	})

	describe("onMetricDataAdded", () => {
		it("should call getScenarios and set the scenarios in viewmodel correctly", () => {
			ScenarioHelper.getScenarios = jest.fn().mockReturnValue([{ name: "scenario", settings: {} }])

			scenarioButtonsController.onMetricDataAdded(metricData)

			expect(ScenarioHelper.getScenarios).toHaveBeenCalledWith(metricData)
			expect(scenarioButtonsController["_viewModel"].scenarios).toEqual([{ name: "scenario", settings: {} }])
		})
	})

	describe("applyScenario", () => {
		it("should call getScenarioSettingsByName and set call updateSettings with scenarioSettings", () => {
			const mockScenarioSettings = {}
			ScenarioHelper.getScenarioSettingsByName = jest.fn().mockReturnValue(mockScenarioSettings)
			storeService.dispatch = jest.fn()

			scenarioButtonsController.applyScenario("scenario")

			expect(settingsService.updateSettings).toHaveBeenCalledWith(mockScenarioSettings)
			expect(storeService.dispatch).toHaveBeenCalledWith(setState({}))
			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})
	})
})
