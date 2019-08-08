import "./edgeChooser.module"
import { EdgeChooserController } from "./edgeChooser.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { IRootScopeService } from "angular"

describe("EdgeChooserController", () => {
	let edgeChooserController: EdgeChooserController
	let $rootScope: IRootScopeService
	let edgeMetricService: EdgeMetricService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeChooser")

		$rootScope = getService<IRootScopeService>("$rootScope")
		edgeMetricService = getService<EdgeMetricService>("edgeMetricService")
	}

	function rebuildController() {
		edgeChooserController = new EdgeChooserController($rootScope, edgeMetricService)
	}

	// TODO: Write some tests
	describe("someMethodName", () => {
		it("should do something", () => {
			edgeChooserController.onEdgeMetricDataUpdated(null)
		})
	})
})
