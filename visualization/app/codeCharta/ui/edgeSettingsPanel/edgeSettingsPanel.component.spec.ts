import "./edgeSettingsPanel.module"
import { EdgeSettingsPanelController } from "./edgeSettingsPanel.component"
import { instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("EdgeSettingsPanelController", () => {
	let edgeSettingsPanelController: EdgeSettingsPanelController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeSettingsPanel")
	}

	function rebuildController() {
		edgeSettingsPanelController = new EdgeSettingsPanelController()
	}

	describe("someMethodName", () => {
		it("should do something", () => {})
	})
})
