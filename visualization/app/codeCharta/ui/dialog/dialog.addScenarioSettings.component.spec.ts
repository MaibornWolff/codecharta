import "./dialog.module.ts"
import { StoreService } from "../../state/store.service"
import { DialogAddScenarioSettingsComponent } from "./dialog.addScenarioSettings.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DialogService } from "./dialog.service"
import { setState } from "../../state/store/state.actions"
import {
	FILE_ATTRIBUTE_CONTENT,
	FILE_ATTRIBUTE_CONTENT_CAMERA_UNSELECTED,
	FILE_ATTRIBUTE_CONTENT_NONE_SELECTED,
	FILE_ATTRIBUTE_CONTENT_WITHOUT_CAMERA,
	STATE
} from "../../util/dataMocks"
import { ScenarioHelper } from "../../util/scenarioHelper"

describe("DialogAddScenarioSettingsComponent", () => {
	let dialogAddScenarioSettings: DialogAddScenarioSettingsComponent
	let $mdDialog
	let storeService: StoreService
	let dialogService: DialogService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function rebuildController() {
		dialogAddScenarioSettings = new DialogAddScenarioSettingsComponent($mdDialog, storeService, dialogService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$mdDialog = getService("$mdDialog")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
	}

	describe("constructor", () => {
		it("should call initDialogFields and set the fileContent", () => {
			storeService.dispatch(setState(STATE))

			rebuildController()

			expect(dialogAddScenarioSettings["_viewModel"].fileContent).toEqual(FILE_ATTRIBUTE_CONTENT)
		})
	})

	describe("addScenario", () => {
		it("should return an error, when isScenarioExisting function is true", () => {
			ScenarioHelper.isScenarioExisting = jest.fn().mockReturnValue(true)
			dialogService.showErrorDialog = jest.fn()

			dialogAddScenarioSettings.addScenario()

			expect(dialogService.showErrorDialog).toHaveBeenCalled()
		})

		it("should return an error Message, when the filename is null", () => {
			ScenarioHelper.isScenarioExisting = jest.fn().mockReturnValue(false)
			dialogService.showErrorDialog = jest.fn()

			dialogAddScenarioSettings.addScenario()

			expect(dialogService.showErrorDialog).toHaveBeenCalled()
		})

		it("should return an error Message, when none of the FileConent is selected", () => {
			dialogAddScenarioSettings["_viewModel"].fileContent = FILE_ATTRIBUTE_CONTENT_NONE_SELECTED
			dialogAddScenarioSettings["_viewModel"].scenarioName = "scenario1"
			ScenarioHelper.isScenarioExisting = jest.fn().mockReturnValue(false)
			dialogService.showErrorDialog = jest.fn()

			dialogAddScenarioSettings.addScenario()

			expect(dialogService.showErrorDialog).toHaveBeenCalled()
		})

		it("should call createNewScenario Function with the selected fileAttributes", () => {
			dialogAddScenarioSettings["_viewModel"].fileContent = FILE_ATTRIBUTE_CONTENT_CAMERA_UNSELECTED
			dialogAddScenarioSettings["_viewModel"].scenarioName = "scenario1"
			ScenarioHelper.isScenarioExisting = jest.fn().mockReturnValue(false)
			ScenarioHelper.createNewScenario = jest.fn()

			dialogAddScenarioSettings.addScenario()

			expect(ScenarioHelper.createNewScenario).toHaveBeenCalledWith("scenario1", FILE_ATTRIBUTE_CONTENT_WITHOUT_CAMERA)
		})
	})
})
