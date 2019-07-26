import "./searchBar.module"
import { SearchBarController } from "./searchBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { BlacklistType, CodeMapNode, BlacklistItem } from "../../codeCharta.model"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"

describe("SearchBarController", () => {
	let searchBarController: SearchBarController

	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let codeMapActionsService: CodeMapActionsService
	let codeMapPreRenderService: CodeMapPreRenderService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
	}

	function rebuildController() {
		searchBarController = new SearchBarController($rootScope, settingsService, codeMapActionsService)
	}

	describe("onFileSelectionStatesChanged", () => {
		it("should set empty searchPattern", () => {
			searchBarController["_viewModel"].searchPattern = "*fileSettings"
			searchBarController.onFileSelectionStatesChanged(null, null)

			expect(searchBarController["_viewModel"].searchPattern).toBe("")
			expect(settingsService.getSettings().dynamicSettings.searchPattern).toBe("")
		})
	})

	describe("applySettingsSearchPattern", () => {
		it("should set searchPattern in settings", () => {
			searchBarController["_viewModel"].searchPattern = "*fileSettings"
			searchBarController.applySettingsSearchPattern()
			expect(settingsService.getSettings().dynamicSettings.searchPattern).toBe(searchBarController["_viewModel"].searchPattern)
		})
	})

	describe("onClickBlacklistPattern", () => {
		it("should add new blacklist entry and clear searchPattern", () => {
			const blacklistItem = { path: "/root/node/path", type: BlacklistType.exclude }
			searchBarController["_viewModel"].searchPattern = blacklistItem.path

			searchBarController.onClickBlacklistPattern(blacklistItem.type)

			expect(settingsService.getSettings().fileSettings.blacklist).toContainEqual(blacklistItem)
			expect(searchBarController["_viewModel"].searchPattern).toBe("")
		})
	})

	describe("updateViewModel", () => {
		let searchedNodeLeaves: CodeMapNode[]
		let rootNode = VALID_NODE_WITH_PATH
		beforeEach(() => {
			searchBarController["_viewModel"].searchPattern = "/root/node/path"
		})

		it("should update ViewModel when pattern not blacklisted", () => {
			const blacklist: BlacklistItem[] = []
			searchBarController["updateViewModel"](blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeFalsy()
		})

		it("should update ViewModel when pattern excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/another/node/path", type: BlacklistType.exclude }
			]
			searchBarController["updateViewModel"](blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
		})

		it("should update ViewModel when pattern hidden and excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/node/path", type: BlacklistType.hide }
			]
			searchBarController["updateViewModel"](blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeTruthy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
		})
	})
})
