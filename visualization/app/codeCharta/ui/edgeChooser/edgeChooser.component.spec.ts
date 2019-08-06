import "./edgeChooser.module"
import { EdgeChooserController } from "./edgeChooser.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("EdgeChooserController", () => {
	let edgeChooserController: EdgeChooserController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeChooser")
	}

	function rebuildController() {
		edgeChooserController = new EdgeChooserController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
