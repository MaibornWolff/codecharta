import "./dialog.module.ts"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DialogService } from "./dialog.service"
import { CCFileValidationResult } from "../../util/fileValidator"

describe("DialogService", () => {
	let dialogService: DialogService
	let $mdDialog

	beforeEach(() => {
		restartSystem()
		rebuildController()
		dialogService.showCustomDialog = jest.fn()
		dialogService.showErrorDialog = jest.fn()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")
		$mdDialog = getService("$mdDialog")
	}

	function rebuildController() {
		dialogService = new DialogService($mdDialog)
	}

	it("should show DownloadDialog", function () {
		dialogService.showDownloadDialog()

		expect(dialogService.showCustomDialog).toHaveBeenCalled()
	})

	it("should show ValidationDialog", function () {
		const fileValidationResults: CCFileValidationResult[] = [
			{ fileName: "file_1", errors: ["Error"], warnings: [] },
			{ fileName: "file_2", errors: [], warnings: ["Warning"] }
		]
		dialogService.showValidationDialog(fileValidationResults)

		expect(dialogService.showErrorDialog).toHaveBeenCalledWith(
			`<h2>Errors</h2><p><strong>file_1:</strong> <p><i class="fa fa-exclamation-circle"></i> Error</p></p><h2>Warnings</h2><p><strong>file_2:</strong> <p><i class="fa fa-exclamation-triangle"></i> Warning</p></p>`,
			"Something is wrong with the uploaded file(s)"
		)
	})
})
