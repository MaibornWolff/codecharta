/* import "../../scenarioDropDown/scenarioDropDown.module"
import "../../codeMap/threeViewer/threeViewer.module"
import { ScenarioDropDownController } from "../../scenarioDropDown/scenarioDropDown.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { ScenarioHelper } from "../../../util/scenarioHelper"
import { StoreService } from "../../../state/store.service"
import { setState } from "../../../state/store/state.actions"
import { DialogService } from "../../dialog/dialog.service"
import { METRIC_DATA, SCENARIO_ITEMS } from "../../../util/dataMocks"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControlsService"
import { MetricDataService } from "../../../state/store/metricData/metricData.service"
import { nodeMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCameraService"
import { MatDialog } from "@angular/material/dialog"

const mockedNodeMetricDataSelector = nodeMetricDataSelector as unknown as jest.Mock
jest.mock("../../state/selectors/accumulatedData/metricData/nodeMetricData.selector", () => ({
	nodeMetricDataSelector: jest.fn()
}))

describe("ScenarioDropDownController", () => {
	let scenarioButtonsController: ScenarioDropDownController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeCameraService: ThreeCameraService
	let mockedDialog: MatDialog

	function rebuildController() {
		mockedDialog = { open: jest.fn() } as unknown as MatDialog
		scenarioButtonsController = new ScenarioDropDownController(
			$rootScope,
			storeService,
			dialogService,
			threeOrbitControlsService,
			threeCameraService,
			mockedDialog
		)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.scenarioDropDown")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")

		mockedNodeMetricDataSelector.mockImplementation(() => METRIC_DATA)
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	describe("constructor", () => {
		it("should subscribe to MetricDataService", () => {
			MetricDataService.subscribe = jest.fn()

			rebuildController()

			expect(MetricDataService.subscribe).toHaveBeenCalledWith($rootScope, scenarioButtonsController)
		})
	})

	describe("onMetricDataAdded", () => {
		it("should call getScenarioItems and set the scenarios in viewmodel correctly", () => {
			ScenarioHelper.getScenarioItems = jest.fn().mockReturnValue(SCENARIO_ITEMS)

			scenarioButtonsController.onMetricDataChanged()

			expect(scenarioButtonsController["_viewModel"].dropDownScenarioItems).toEqual(SCENARIO_ITEMS)
		})
	})

	describe("loadScenario", () => {
		it("should call getScenarioHelpers and set the dropDownScenarioItems ", () => {
			ScenarioHelper.getScenarioItems = jest.fn().mockReturnValue(SCENARIO_ITEMS)

			scenarioButtonsController.onMetricDataChanged()

			expect(scenarioButtonsController["_viewModel"].dropDownScenarioItems).toEqual(SCENARIO_ITEMS)
		})
	})

	describe("applyScenario", () => {
		it("should call setControl and call store.dispatch with scenarioSettings", () => {
			ScenarioHelper.scenarios.set("Scenario1", {
				name: "Scenario1",
				area: { areaMetric: "rloc", margin: 50 },
				edge: { edgeHeight: 42 },
				camera: {
					camera: { x: 1, y: 1, z: 1 },
					cameraTarget: { x: 2, y: 2, z: 2 }
				}
			})
			scenarioButtonsController["isScenarioApplicable"] = jest.fn().mockReturnValue(true)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()
			threeCameraService.setPosition = jest.fn()

			scenarioButtonsController.applyScenario("Scenario1")

			expect(storeService.dispatch).toHaveBeenCalledWith(
				setState({
					dynamicSettings: { areaMetric: "rloc", margin: 50 },
					appSettings: { edgeHeight: 42 }
				})
			)
			expect(threeCameraService.setPosition).toHaveBeenCalledWith({ x: 1, y: 1, z: 1 })
			expect(threeOrbitControlsService.setControlTarget).toHaveBeenCalledWith({ x: 2, y: 2, z: 2 })
		})
	})

	describe("showAddScenarioSettings", () => {
		it("should call showAddScenarioSettings", () => {
			scenarioButtonsController.showAddScenarioSettings()

			expect(mockedDialog.open).toHaveBeenCalled()
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
 */
