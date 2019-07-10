import "./searchPanel.module"
import { SearchPanelController } from "./searchPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { SettingsService } from "../../state/settings.service"
import { IRootScopeService } from "angular"
import { RecursivePartial, Settings, SearchPanelMode } from "../../codeCharta.model"

describe("SearchPanelController", () => {
	let searchPanelModeController: SearchPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanel")
		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		searchPanelModeController = new SearchPanelController($rootScope, settingsService)
	}

	describe("Show components selected", () => {
		it("should set searchPanelMode correctly", () => {
			let update: RecursivePartial<Settings> = { dynamicSettings: { searchPanelMode: SearchPanelMode.treeView } }

			searchPanelModeController.onSettingsChanged(null, update, null)

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.treeView)
		})

		it("should set searchPanelMode to none", () => {
			let update: RecursivePartial<Settings> = { dynamicSettings: { searchPanelMode: SearchPanelMode.minimized } }

			searchPanelModeController.onSettingsChanged(null, update, null)

			expect(searchPanelModeController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.minimized)
		})
	})

	describe("toggle", () => {
		beforeEach(() => {
			searchPanelModeController["settingsService"].updateSettings, (settingsService.updateSettings = jest.fn())
		})

		it("should switch to treeView if minimized", () => {
			searchPanelModeController.toggle()

			expect(settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { searchPanelMode: SearchPanelMode.treeView } })
		})

		it("should minimize when opened click", () => {
			searchPanelModeController["_viewModel"].searchPanelMode = SearchPanelMode.hide

			searchPanelModeController.toggle()

			expect(settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { searchPanelMode: SearchPanelMode.minimized } })
		})
	})
})
