import "./globalSettingsButton.module"
import { GlobalSettingsButtonController } from "./globalSettingsButton.component"
import { DialogService } from "../dialog/dialog.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("GlobalSettingsButtonController", () => {
	let globalSettingsButtonController: GlobalSettingsButtonController
	let dialogService: DialogService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedDialogService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.globalSettingsButton")

		dialogService = getService<DialogService>("dialogService")
	}

	function rebuildController() {
		globalSettingsButtonController = new GlobalSettingsButtonController(dialogService)
	}

	function withMockedDialogService() {
		dialogService = globalSettingsButtonController["dialogService"] = jest.fn().mockReturnValue({
			showGlobalSettingsDialog: jest.fn()
		})()
	}

	describe("showGlobalSettings", () => {
		it("should call showGlobalSettingsDialog", () => {
			globalSettingsButtonController.showGlobalSettings()

			expect(dialogService.showGlobalSettingsDialog).toHaveBeenCalled()
		})
	})
})
