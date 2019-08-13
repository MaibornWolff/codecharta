import "./edgeChooser.module"
import { EdgeChooserController } from "./edgeChooser.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"

describe("EdgeChooserController", () => {
	let edgeChooserController: EdgeChooserController
	let $rootScope: IRootScopeService
	let edgeMetricService: EdgeMetricService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeChooser")

		$rootScope = getService<IRootScopeService>("$rootScope")
		edgeMetricService = getService<EdgeMetricService>("edgeMetricService")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		edgeChooserController = new EdgeChooserController($rootScope, edgeMetricService, null, settingsService)
	}

	// TODO: Write some tests
	describe("someMethodName", () => {
		it("should do something", () => {
			edgeChooserController.onEdgeMetricDataUpdated(null)
		})
	})
})
