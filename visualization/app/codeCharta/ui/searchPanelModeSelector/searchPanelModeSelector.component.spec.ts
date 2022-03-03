import "./searchPanelModeSelector.module"
import { SearchPanelModeSelectorController } from "./searchPanelModeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { BlacklistType } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

describe("SearchPanelModeSelectorController", () => {
	let searchPanelModeSelectorController: SearchPanelModeSelectorController
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchPanelModeSelector")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		searchPanelModeSelectorController = new SearchPanelModeSelectorController($rootScope)
	}

	describe("constructor", () => {
		it("should subscribe to Blacklist-Event", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, searchPanelModeSelectorController)
		})
	})

	describe("onBlacklistChanged", () => {
		it("should update counters", () => {
			const blacklist = [
				{ path: "/root", type: BlacklistType.flatten },
				{
					path: "/root/foo",
					type: BlacklistType.exclude
				},
				{ path: "/root/bar", type: BlacklistType.exclude }
			]

			searchPanelModeSelectorController.onBlacklistChanged(blacklist)

			expect(searchPanelModeSelectorController["_viewModel"].flattenListLength).toEqual(1)
			expect(searchPanelModeSelectorController["_viewModel"].excludeListLength).toEqual(2)
		})
	})
})
