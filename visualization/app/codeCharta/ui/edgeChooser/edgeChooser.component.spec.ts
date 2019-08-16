import "./edgeChooser.module"
import { EdgeChooserController } from "./edgeChooser.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"

describe("EdgeChooserController", () => {
	let edgeChooserController: EdgeChooserController
	let $rootScope: IRootScopeService
	let edgeMetricService: EdgeMetricService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeChooser")

		$rootScope = getService<IRootScopeService>("$rootScope")
		edgeMetricService = getService<EdgeMetricService>("edgeMetricService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		edgeChooserController = new EdgeChooserController($rootScope, edgeMetricService, codeMapActionsService, settingsService)
	}

	// TODO: Write some tests
	describe("constructor", () => {
		it("should subscribe to EdgeMetricService", () => {
			EdgeMetricService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, edgeChooserController)
		})
	})
})
