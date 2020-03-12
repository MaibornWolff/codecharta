import "./blacklistPanel.module"
import { BlacklistPanelController } from "./blacklistPanel.component"
import { BlacklistItem, BlacklistType } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { StoreService } from "../../state/store.service"

describe("blacklistController", () => {
	let blacklistPanelController: BlacklistPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.blacklistPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		blacklistPanelController = new BlacklistPanelController($rootScope, storeService)
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

	describe("removeBlacklistEntry", () => {
		it("should remove blacklist entry", () => {
			storeService.dispatch(addBlacklistItem({ path: "/some/leaf", type: BlacklistType.exclude }))
			const entry = { path: "/some/leaf", type: BlacklistType.exclude }

			blacklistPanelController.removeBlacklistEntry(entry)

			expect(storeService.getState().fileSettings.blacklist).not.toContainEqual(entry)
		})
	})
})
