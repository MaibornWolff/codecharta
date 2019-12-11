import "./blacklistPanel.module"
import { BlacklistPanelController } from "./blacklistPanel.component"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { BlacklistItem, BlacklistType, SearchPanelMode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("blacklistController", () => {
	let blacklistPanelController: BlacklistPanelController
	let $rootScope: IRootScopeService
	let codeMapActionsService: CodeMapActionsService

	let blacklistItem: BlacklistItem

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedCodeMapActionsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.blacklistPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")

		blacklistItem = { path: "/root", type: BlacklistType.exclude }
	}

	function rebuildController() {
		blacklistPanelController = new BlacklistPanelController(codeMapActionsService, $rootScope)
	}

	function withMockedCodeMapActionsService() {
		codeMapActionsService = blacklistPanelController["codeMapActionsService"] = jest.fn<CodeMapActionsService>(() => {
			return {
				removeBlacklistEntry: jest.fn()
			}
		})()
	}

	describe("onBlacklistChanged", () => {
		it("should set new excluded nodes", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root", type: BlacklistType.exclude },
				{ path: "/root/file", type: BlacklistType.flatten }
			]

			blacklistPanelController.onBlacklistChanged(blacklist)

			expect(blacklistPanelController["_viewModel"].exclude).toEqual([blacklist[0]])
		})

		it("should set new flattened nodes", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root", type: BlacklistType.exclude },
				{ path: "/root/file", type: BlacklistType.flatten }
			]

			blacklistPanelController.onBlacklistChanged(blacklist)

			expect(blacklistPanelController["_viewModel"].flatten).toEqual([blacklist[1]])
		})
	})

	describe("onSearchPanelModeChanged", () => {
		it("should set new searchPanelMode", () => {
			blacklistPanelController.onSearchPanelModeChanged(SearchPanelMode.minimized)

			expect(blacklistPanelController["_viewModel"].searchPanelMode).toEqual(SearchPanelMode.minimized)
		})
	})

	describe("removeBlacklistEntry", () => {
		it("call codeMapActionsService.removeBlacklistEntry", () => {
			blacklistPanelController.removeBlacklistEntry(blacklistItem)

			expect(codeMapActionsService.removeBlacklistEntry).toHaveBeenCalledWith({ path: "/root", type: "exclude" })
		})
	})
})
