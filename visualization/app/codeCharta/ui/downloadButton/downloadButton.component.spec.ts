import "./downloadButton.module"
import { DownloadButtonController } from "./downloadButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DialogService } from "../dialog/dialog.service"

describe("DownloadButtonController", () => {
	let downloadButtonController: DownloadButtonController
	let dialogService: DialogService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedDialogService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.downloadButton")

		dialogService = getService<DialogService>("dialogService")
	}

	function rebuildController() {
		downloadButtonController = new DownloadButtonController(dialogService)
	}

	function withMockedDialogService() {
		dialogService = downloadButtonController["dialogService"] = jest.fn().mockReturnValue({
			showDownloadDialog: jest.fn()
		})()
	}

	describe("downloadFile", () => {
		it("should call showDownloadDialog", () => {
			downloadButtonController.downloadFile()

			expect(dialogService.showDownloadDialog).toHaveBeenCalled()
		})
	})
})
