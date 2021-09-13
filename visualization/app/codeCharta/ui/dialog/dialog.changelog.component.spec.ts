import "./dialog.module.ts"
import { DialogChangelogController } from "./dialog.changelog.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("DialogChangelogController", () => {
	let dialogChangelogController: DialogChangelogController
	let $mdDialog

	beforeEach(() => {
		restartSystem()
		Storage.prototype.getItem = jest.fn(() => "1.70.0")
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")
		$mdDialog = getService("$mdDialog")
	}
	function rebuildController() {
		dialogChangelogController = new DialogChangelogController($mdDialog)
	}

	describe("constructor", () => {
		it("should extract the changes from changelog since last time visited", () => {
			Storage.prototype.getItem = jest.fn(() => "1.70.0")
			rebuildController()
			expect(dialogChangelogController["_viewModel"].changes).not.toBeNull()
			expect(dialogChangelogController["_viewModel"].changes["Added 🚀"]).not.toBeNull()
			expect(dialogChangelogController["_viewModel"].changes["Fixed 🐞"]).not.toBeNull()
			expect(dialogChangelogController["_viewModel"].changes["Removed 🗑"]).toBeUndefined()
		})
	})

	describe("hide", () => {
		it("should hide dialog properly", () => {
			$mdDialog.hide = jest.fn()

			dialogChangelogController.hide()

			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})
})
