import "./blacklistPanel.module"

import { SettingsService } from "../../state/settingsService/settings.service"
import { BlacklistPanelController } from "./blacklistPanel.component"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { BlacklistType, BlacklistItem, RecursivePartial, Settings, SearchPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"

describe("blacklistController", () => {
	let blacklistPanelController: BlacklistPanelController
	let blacklistItem: BlacklistItem

	let services

	beforeEach(() => {
		restartSystem()
		mockBlacklistElement()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.blacklistPanel")

		const CodeMapActionsServiceMock = jest.fn<CodeMapActionsService>(() => ({
			removeBlacklistEntry: jest.fn()
		}))

		services = {
			$rootScope: getService<IRootScopeService>("$rootScope"),
			settingsService: getService<SettingsService>("settingsService"),
			codeMapActionsService: new CodeMapActionsServiceMock()
		}
	}

	function mockBlacklistElement() {
		blacklistItem = { path: "/root", type: BlacklistType.exclude }
	}

	function rebuildController() {
		blacklistPanelController = new BlacklistPanelController(services.codeMapActionsService, services.$rootScope)
	}

	function getFilteredBlacklistBy(blacklistItem) {
		if (services.settingsService.settings.fileSettings.blacklist) {
			return services.settingsService.settings.fileSettings.blacklist.filter(item => {
				return item.path == blacklistItem.path && item.type == blacklistItem.type
			})
		} else {
			return []
		}
	}

	it("add and call includingNode function when removing blacklist entry", () => {
		services.settingsService.settings.fileSettings.blacklist.push(blacklistItem)
		expect(getFilteredBlacklistBy({ path: "/root", type: BlacklistType.exclude })).toHaveLength(1)

		blacklistPanelController.removeBlacklistEntry(blacklistItem)
		expect(services.codeMapActionsService.removeBlacklistEntry).toHaveBeenCalledWith({ path: "/root", type: "exclude" })
	})

	it("update local blacklist with settingsService onBlacklistChanged", () => {
		blacklistPanelController.onBlacklistChanged([blacklistItem])

		expect(blacklistPanelController["_viewModel"].exclude).toEqual([blacklistItem])
		expect(blacklistPanelController["_viewModel"].hide).toEqual([])
	})

	it("update local searchPanelMode onSearchPanelModeChanged", () => {
		let searchPanelMode = SearchPanelMode.hide

		blacklistPanelController.onSearchPanelModeChanged(searchPanelMode)

		expect(blacklistPanelController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.hide)
	})
})
