import "./dialog.changelog.module"
//import { DialogChangelogController } from "./dialog.changelog.component"
//import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
//import { SCENARIO_ATTRIBUTE_CONTENT } from "../../util/dataMocks"

describe("DialogChangelogController", () => {
	//let dialogChangelogController: DialogChangelogController
	//let $mdDialog

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		//instantiateModule("app.codeCharta.ui.dialogChangelog")
		//$mdDialog = getService("$mdDialog")
	}

	function rebuildController() {
		//dialogChangelogController = new DialogChangelogController($mdDialog)
	}

	describe("constructor", () => {
		it("should extract the changes from changelog since last time visited", () => {
			rebuildController()
		})
	})
})
