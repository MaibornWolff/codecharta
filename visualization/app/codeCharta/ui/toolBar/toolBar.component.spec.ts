import "./toolBar.module"
import { ToolBarController } from "./toolBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { DialogService } from "../dialog/dialog.service"

describe("ToolBarController", () => {
	let toolBarController: ToolBarController
	let dialogService: DialogService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedDialogService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.toolBar")

		dialogService = getService<DialogService>("dialogService")
	}

	function rebuildController() {
		toolBarController = new ToolBarController(dialogService)
	}

	function withMockedDialogService() {
		dialogService = toolBarController["dialogService"] = jest.fn().mockReturnValue({
			showDownloadDialog: jest.fn(),
			showGlobalSettingsDialog: jest.fn()
		})()
	}

	describe("downloadFile", () => {
		it("should call showDownloadDialog", () => {
			toolBarController.downloadFile()

			expect(dialogService.showDownloadDialog).toHaveBeenCalled()
		})
	})

	describe("showGlobalSettings", () => {
		it("should call showGlobalSettingsDialog", () => {
			toolBarController.showGlobalSettings()

			expect(dialogService.showGlobalSettingsDialog).toHaveBeenCalled()
		})
	})
})
