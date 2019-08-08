import "./edgePanel.module"
import { EdgePanelController } from "./edgePanel.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("EdgePanelController", () => {
	let edgePanelController: EdgePanelController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgePanel")
	}

	function rebuildController() {
		edgePanelController = new EdgePanelController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {
			edgePanelController
		})
	})
})
