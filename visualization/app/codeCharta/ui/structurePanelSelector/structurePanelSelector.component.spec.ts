import "./structurePanelSelector.module"
import { StructurePanelSelectorController } from "./structurePanelSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { SETTINGS } from "../../util/dataMocks"
import { FloatingPanelMode, BlacklistType } from "../../codeCharta.model"

describe("StructurePanelSelectorController", () => {
	let structurePanelSelectorController: StructurePanelSelectorController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.structurePanelSelector")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		structurePanelSelectorController = new StructurePanelSelectorController(settingsService, $rootScope)
	}

	function withMockedSettingsService() {
		settingsService = structurePanelSelectorController["settingsService"] = jest.fn().mockReturnValue({
			updateSettings: jest.fn()
		})()
	}

	describe("onSettingsChanged", () => {
		it("should update floatingPanelMode", () => {
			SETTINGS.dynamicSettings.floatingPanelMode = FloatingPanelMode.hide

			structurePanelSelectorController.onSettingsChanged(SETTINGS, null, null)

			expect(structurePanelSelectorController["_viewModel"].floatingPanelMode).toEqual(FloatingPanelMode.hide)
		})

		it("should update counters", () => {
			let blacklistItem1 = { path: "/root", type: BlacklistType.hide }
			let blacklistItem2 = { path: "/root/foo", type: BlacklistType.exclude }
			let blacklistItem3 = { path: "/root/bar", type: BlacklistType.exclude }
			let blacklist = [blacklistItem1, blacklistItem2, blacklistItem3]
			SETTINGS.fileSettings.blacklist = blacklist

			structurePanelSelectorController.onSettingsChanged(SETTINGS, null, null)

			expect(structurePanelSelectorController["_viewModel"].hideListLength).toEqual(1)
			expect(structurePanelSelectorController["_viewModel"].excludeListLength).toEqual(2)
		})
	})

	describe("onTogglefloatingPanelMode", () => {
		it("should select if not already selected", () => {
			structurePanelSelectorController.onToggleFloatingPanelMode(FloatingPanelMode.treeView)

			expect(settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { floatingPanelMode: FloatingPanelMode.treeView } })
		})

		it("should unselect if already selected", () => {
			structurePanelSelectorController.onToggleFloatingPanelMode(FloatingPanelMode.treeView)

			structurePanelSelectorController.onToggleFloatingPanelMode(FloatingPanelMode.treeView)

			expect(settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { floatingPanelMode: FloatingPanelMode.minimized } })
		})
	})
})
