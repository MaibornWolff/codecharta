import "./removeFileButton.module"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("RemoveFileButtonController", () => {
	beforeEach(() => {
		restartSystem()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.removeFileButton")
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
