import "./artificialIntelligence.module"
import { ArtificialIntelligenceController } from "./artificialIntelligence.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("ArtificialIntelligenceController", () => {
	let artificialIntelligenceController: ArtificialIntelligenceController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.artificialIntelligence")
	}

	function rebuildController() {
		artificialIntelligenceController = new ArtificialIntelligenceController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
