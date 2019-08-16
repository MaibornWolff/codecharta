import "./edgeSettingsPanel.module"
import { EdgeSettingsPanelController } from "./edgeSettingsPanel.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"

describe("EdgeSettingsPanelController", () => {
	let edgeSettingsPanelController: EdgeSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let edgeMetricService: EdgeMetricService
	let codeMapActionsService: CodeMapActionsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		edgeMetricService = getService<EdgeMetricService>("edgeMetricService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
	}

	function rebuildController() {
		edgeSettingsPanelController = new EdgeSettingsPanelController($rootScope, settingsService, edgeMetricService, codeMapActionsService)
	}

	describe("constructor", () => {
		it("should subscribe to SettingsService", () => {
			SettingsService.subscribe = jest.fn()

			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, edgeSettingsPanelController)
		})
	})
})
