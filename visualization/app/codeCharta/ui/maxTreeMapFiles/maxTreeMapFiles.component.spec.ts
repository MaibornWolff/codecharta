import "./maxTreeMapFiles.module"
import { MaxTreeMapFilesController } from "./maxTreeMapFiles.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("MaxTreeMapFilesController", () => {
	let maxTreeMapFilesController: MaxTreeMapFilesController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.maxTreeMapFiles")
	}

	function rebuildController() {
		maxTreeMapFilesController = new MaxTreeMapFilesController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
