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

		it("should set new flattened node with a shortened path", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root", type: BlacklistType.exclude },
				{ path: "/this_is_a_very_long_file_path_that_would_not_fit/root/file", type: BlacklistType.flatten }
			]
			const SHORTENED_PATH = "../root/file"

			blacklistPanelController.onBlacklistChanged(blacklist)

			expect(blacklistPanelController["_viewModel"].flatten).toEqual([blacklist[1]])
			expect(SHORTENED_PATH).toEqual(blacklist[1].display_path)
		})

		it("should correctly set multiple filenames", () => {
			const blackList: BlacklistItem[] = [
				{ path: "/root", type: BlacklistType.exclude },
				{ path: "/root/someLeaf", type: BlacklistType.exclude },
				{ path: "/root/otherLeaf", type: BlacklistType.exclude },
				{ path: "/root/leaf/someOtherLeaf", type: BlacklistType.exclude }
			]

			blacklistPanelController.onBlacklistChanged(blackList)

			expect(blacklistPanelController["_viewModel"].exclude).toEqual(blackList)
		})

		describe("removeBlacklistEntry", () => {
			it("should remove blacklist entry", () => {
				const entry = { path: "/some/leaf", type: BlacklistType.exclude }

				storeService.dispatch(addBlacklistItem({ ...entry }))

				blacklistPanelController.removeBlacklistEntry(entry)

				expect(storeService.getState().fileSettings.blacklist).not.toContainEqual(entry)
			})
		})
	})
})
