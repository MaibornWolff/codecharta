import { MatLegacyDialog } from "@angular/material/legacy-dialog"
import { State } from "../../../state/angular-redux/state"
import { Store } from "../../../state/angular-redux/store"
import { setState } from "../../../state/store/state.actions"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCamera.service"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControls.service"
import { ErrorDialogComponent } from "../../dialogs/errorDialog/errorDialog.component"
import { ScenarioService } from "./scenario.service"
import { ScenarioHelper } from "./scenarioHelper"

describe("scenarioService", () => {
	let scenarioService: ScenarioService
	let mockedStore: Store
	let mockedDialog: MatLegacyDialog
	let mockedThreeCameraService: ThreeCameraService
	let mockedThreeOrbitControlsService: ThreeOrbitControlsService

	beforeEach(() => {
		const mockedState = {} as unknown as State
		mockedStore = { dispatch: jest.fn() } as unknown as Store
		mockedDialog = { open: jest.fn() } as unknown as MatLegacyDialog
		mockedThreeCameraService = { setPosition: jest.fn() } as unknown as ThreeCameraService
		mockedThreeOrbitControlsService = { setControlTarget: jest.fn() } as unknown as ThreeOrbitControlsService
		scenarioService = new ScenarioService(
			mockedState,
			mockedStore,
			mockedDialog,
			mockedThreeCameraService,
			mockedThreeOrbitControlsService
		)

		ScenarioHelper.scenarios.set("Scenario1", {
			name: "Scenario1",
			area: { areaMetric: "rloc", margin: 50 },
			edge: { edgeHeight: 42 },
			camera: {
				camera: { x: 1, y: 1, z: 1 },
				cameraTarget: { x: 2, y: 2, z: 2 }
			}
		})
	})

	it("should apply a scenario", () => {
		scenarioService.applyScenario("Scenario1")
		expect(mockedStore.dispatch).toHaveBeenCalledWith(
			setState({
				dynamicSettings: { areaMetric: "rloc", margin: 50 },
				appSettings: { edgeHeight: 42 }
			})
		)
		expect(mockedThreeCameraService.setPosition).toHaveBeenCalledWith({ x: 1, y: 1, z: 1 })
		expect(mockedThreeOrbitControlsService.setControlTarget).toHaveBeenCalledWith({ x: 2, y: 2, z: 2 })
	})

	describe("removeScenario", () => {
		beforeEach(() => {
			ScenarioHelper.deleteScenario = jest.fn()
		})

		it("should call deleteScenario", () => {
			scenarioService.removeScenario("Scenario1")
			expect(ScenarioHelper.deleteScenario).toHaveBeenCalledWith("Scenario1")
			expect(mockedDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
				data: {
					title: "Info",
					message: "Scenario1 deleted."
				}
			})
		})

		it("should not delete default 'Complexity' scenario", () => {
			scenarioService.removeScenario("Complexity")
			expect(ScenarioHelper.deleteScenario).not.toHaveBeenCalled()
			expect(mockedDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
				data: {
					title: "Error",
					message: "Complexity cannot be deleted as it is the default Scenario."
				}
			})
		})
	})
})
