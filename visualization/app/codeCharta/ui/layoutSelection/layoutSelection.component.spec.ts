import "./layoutSelection.module"
import { LayoutSelectionController } from "./layoutSelection.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("LayoutSelectionController", () => {
	let layoutSelectionController: LayoutSelectionController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.layoutSelection")
	}

	function rebuildController() {
		layoutSelectionController = new LayoutSelectionController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
