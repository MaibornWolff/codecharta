import "./scenarioDropDown.module"
import "../codeMap/threeViewer/threeViewer.module"
import { ScenarioDropDownController } from "./scenarioDropDown.component"
import { IRootScopeService } from "angular"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MetricService } from "../../state/metric.service"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { MetricData } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"

describe("ScenarioDropDownController", () => {
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let scenarioButtonsController: ScenarioDropDownController
	let metricData: MetricData[]

	function rebuildController() {
		scenarioButtonsController = new ScenarioDropDownController($rootScope, storeService, threeOrbitControlsService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.scenarioDropDown")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")

		metricData = [
			{ name: "rloc", maxValue: 999999 },
			{ name: "functions", maxValue: 999999 },
			{ name: "mcc", maxValue: 999999 }
		]
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
		it("should call getScenarioSettingsByName and call store.dispatch with scenarioSettings", () => {
			const mockScenarioSettings = {}
			ScenarioHelper.getScenarioSettingsByName = jest.fn().mockReturnValue(mockScenarioSettings)
			storeService.dispatch = jest.fn()

			scenarioButtonsController.applyScenario("scenario")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState({}))
			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})
	})
})
