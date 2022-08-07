import { MatDialog } from "@angular/material/dialog"
import { State } from "../../../state/angular-redux/state"
import { Store } from "../../../state/angular-redux/store"
import { setState } from "../../../state/store/state.actions"
import { ThreeCameraService } from "../../codeMap/threeViewer/threeCameraService"
import { ThreeOrbitControlsService } from "../../codeMap/threeViewer/threeOrbitControlsService"
import { ErrorDialogComponent } from "../../dialogs/errorDialog/errorDialog.component"
import { ScenarioService } from "./scenario.service"
import { ScenarioHelper } from "./scenarioHelper"

describe("scenarioService", () => {
	let scenarioService: ScenarioService
	let mockedStore: Store
	let mockedDialog: MatDialog
	let threeCameraService: ThreeCameraService
	let threeOrbitControlsService: ThreeOrbitControlsService

	beforeEach(() => {
		const mockedState = {} as unknown as State
		mockedStore = { dispatch: jest.fn() } as unknown as Store
		mockedDialog = { open: jest.fn() } as unknown as MatDialog
		threeCameraService = { setPosition: jest.fn() } as unknown as ThreeCameraService
		threeOrbitControlsService = { setControlTarget: jest.fn() } as unknown as ThreeOrbitControlsService
		scenarioService = new ScenarioService(mockedState, mockedStore, mockedDialog, threeCameraService, threeOrbitControlsService)

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
		expect(threeCameraService.setPosition).toHaveBeenCalledWith({ x: 1, y: 1, z: 1 })
		expect(threeOrbitControlsService.setControlTarget).toHaveBeenCalledWith({ x: 2, y: 2, z: 2 })
	})

	describe("removeScenario", () => {
		beforeEach(() => {
			ScenarioHelper.deleteScenario = jest.fn()
		})

		it("should call deleteScenario", () => {
			scenarioService.removeScenario("Scenario1")
			expect(ScenarioHelper.deleteScenario).toHaveBeenCalledWith("Scenario1")
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
