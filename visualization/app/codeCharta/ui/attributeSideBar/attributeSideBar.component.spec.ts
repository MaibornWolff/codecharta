import "./attributeSideBar.module"
import { AttributeSideBarController } from "./attributeSideBar.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("AttributeSideBarController", () => {
	let attributeSideBarController: AttributeSideBarController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeSideBar")
	}

	function rebuildController() {
		attributeSideBarController = new AttributeSideBarController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
