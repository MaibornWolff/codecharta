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

describe("DialogAddScenarioSettingsComponent", () => {
	let dialogAddScenarioSettings: DialogAddScenarioSettingsComponent
	let $mdDialog
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function rebuildController() {
		dialogAddScenarioSettings = new DialogAddScenarioSettingsComponent($mdDialog, storeService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$mdDialog = getService("$mdDialog")
		storeService = getService<StoreService>("storeService")
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

			dialogAddScenarioSettings.addScenario()

			expect(ScenarioHelper.createNewScenario).toHaveBeenCalledWith("scenario1", SCENARIO_ATTRIBUTE_CONTENT_WITHOUT_CAMERA)
		})
	})
})
