import "./dialog.module.ts"
import { StoreService } from "../../state/store.service"
import { DialogAddScenarioSettingsComponent } from "./dialog.addScenarioSettings.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { setState } from "../../state/store/state.actions"
import {
	SCENARIO_ATTRIBUTE_CONTENT,
	SCENARIO_ATTRIBUTE_CONTENT_CAMERA_UNSELECTED,
	SCENARIO_ATTRIBUTE_CONTENT_WITHOUT_CAMERA,
	STATE
} from "../../util/dataMocks"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { Vector3 } from "three"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

describe("DialogAddScenarioSettingsComponent", () => {
	let dialogAddScenarioSettings: DialogAddScenarioSettingsComponent
	let $mdDialog
	let storeService: StoreService
	let threeCameraService: ThreeCameraService
	let threeOrbitControlsService: ThreeOrbitControlsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function rebuildController() {
		dialogAddScenarioSettings = new DialogAddScenarioSettingsComponent(
			$mdDialog,
			storeService,
			threeCameraService,
			threeOrbitControlsService
		)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$mdDialog = getService("$mdDialog")
		storeService = getService<StoreService>("storeService")
		threeCameraService = { camera: { position: new Vector3(0, 300, 1000) } } as unknown as ThreeCameraService
		threeOrbitControlsService = { controls: { target: new Vector3(177, 0, 299) } } as unknown as ThreeOrbitControlsService
	}

	describe("constructor", () => {
		it("should call initDialogFields and set the fileContent", () => {
			storeService.dispatch(setState(STATE))

			rebuildController()

			expect(dialogAddScenarioSettings["_viewModel"].scenarioContent).toEqual(SCENARIO_ATTRIBUTE_CONTENT)
		})
	})

	describe("addScenario", () => {
		it("should call createNewScenario Function with the selected fileAttributes", () => {
			dialogAddScenarioSettings["_viewModel"].scenarioContent = SCENARIO_ATTRIBUTE_CONTENT_CAMERA_UNSELECTED
			dialogAddScenarioSettings["_viewModel"].scenarioName = "scenario1"
			ScenarioHelper.isScenarioExisting = jest.fn().mockReturnValue(false)
			ScenarioHelper.createNewScenario = jest.fn()
			ScenarioHelper.addScenario = jest.fn()

			dialogAddScenarioSettings.addScenario()

			expect(ScenarioHelper.createNewScenario).toHaveBeenCalledWith("scenario1", SCENARIO_ATTRIBUTE_CONTENT_WITHOUT_CAMERA)
		})
	})
})
