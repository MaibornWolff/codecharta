import "./scenarioDropDown.module"
import "../codeMap/threeViewer/threeViewer.module"
import { ScenarioDropDownController } from "./scenarioDropDown.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MetricService } from "../../state/metric.service"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { MetricData } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { DialogService } from "../dialog/dialog.service"
import { PARTIAL_SETTINGS, SCENARIO_ITEMS } from "../../util/dataMocks"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

describe("ScenarioDropDownController", () => {
	let scenarioButtonsController: ScenarioDropDownController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService
	let metricService: MetricService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let metricData: MetricData[]

	function rebuildController() {
		scenarioButtonsController = new ScenarioDropDownController(
			$rootScope,
			storeService,
			dialogService,
			metricService,
			threeOrbitControlsService
		)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.scenarioDropDown")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
		metricService = getService<MetricService>("metricService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")

		metricData = [{ name: "rloc", maxValue: 999999 }, { name: "functions", maxValue: 999999 }, { name: "mcc", maxValue: 999999 }]
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
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
		it("should call getScenarioItems and set the scenarios in viewmodel correctly", () => {
			ScenarioHelper.getScenarioItems = jest.fn().mockReturnValue(SCENARIO_ITEMS)

			scenarioButtonsController.onMetricDataAdded(metricData)

			expect(scenarioButtonsController["_viewModel"].dropDownScenarioItems).toEqual(SCENARIO_ITEMS)
		})
	})

	describe("loadScenario", () => {
		it("should call getScenarioHelpers and set the dropDownScenarioItems ", () => {
			ScenarioHelper.getScenarioItems = jest.fn().mockReturnValue(SCENARIO_ITEMS)

			scenarioButtonsController.onMetricDataAdded(metricData)

			expect(scenarioButtonsController["_viewModel"].dropDownScenarioItems).toEqual(SCENARIO_ITEMS)
		})
	})

	describe("applyScenario", () => {
		it("should call setControl and call store.dispatch with scenarioSettings", () => {
			ScenarioHelper.getScenarioSettingsByName = jest.fn().mockReturnValue(PARTIAL_SETTINGS)
			scenarioButtonsController["isScenarioAppliable"] = jest.fn().mockReturnValue(true)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			scenarioButtonsController.applyScenario("Scenario1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(PARTIAL_SETTINGS))
			expect(storeService.dispatch).toHaveBeenCalledWith(setColorRange({ from: 19, to: 67 }))
			expect(threeOrbitControlsService.setControlTarget).toHaveBeenCalled()
		})
	})

	describe("showAddScenarioSettings", () => {
		it("should call showAddScenarioSettings", () => {
			dialogService.showAddScenarioSettings = jest.fn()

			scenarioButtonsController.showAddScenarioSettings()

			expect(dialogService.showAddScenarioSettings).toHaveBeenCalled()
		})
	})

	describe("removeScenario", () => {
		beforeEach(() => {
			ScenarioHelper.deleteScenario = jest.fn()
		})

		it("should call deleteScenario", () => {
			scenarioButtonsController.removeScenario("Scenario1")

			expect(ScenarioHelper.deleteScenario).toHaveBeenCalledWith("Scenario1")
		})

		it("should not call deleteScenario, when the scenario selected is Complexity", () => {
			scenarioButtonsController.removeScenario("Complexity")

			expect(ScenarioHelper.deleteScenario).not.toHaveBeenCalled()
		})
	})
})
