import "./nodeOnly.module"
import { NodeOnlyController } from "./nodeOnly.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("NodeOnlyController", () => {
	let nodeOnlyController: NodeOnlyController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.nodeOnly")
	}

	function rebuildController() {
		nodeOnlyController = new NodeOnlyController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {
			nodeOnlyController
		})
	})
})
