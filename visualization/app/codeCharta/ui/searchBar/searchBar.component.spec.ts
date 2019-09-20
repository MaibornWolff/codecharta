import "./searchBar.module"
import { SearchBarController } from "./searchBar.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { FileStateService } from "../../state/fileState.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { BlacklistItem, BlacklistType } from "../../codeCharta.model"

describe("SearchBarController", () => {
	let searchBarController: SearchBarController

	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let codeMapActionsService: CodeMapActionsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
	}

	function rebuildController() {
		searchBarController = new SearchBarController($rootScope, settingsService, codeMapActionsService)
	}

	function withMockedSettingsService(blacklist: BlacklistItem[]) {
		settingsService = searchBarController["settingsService"] = jest.fn().mockReturnValue({
			getSettings: jest.fn().mockReturnValue({
				fileSettings: {
					blacklist: blacklist
				}
			})()
		})()
	}

	function withMockedEventMethods() {
		$rootScope.$on = searchBarController["$rootScope"].$on = jest.fn()
		$rootScope.$broadcast = searchBarController["$rootScope"].$broadcast = jest.fn()
	}

	describe("constructor", () => {
		beforeEach(() => {
			withMockedEventMethods()
		})

		it("subscribe to blacklist", () => {
			SettingsService.subscribeToBlacklist = jest.fn()

			rebuildController()

			expect(SettingsService.subscribeToBlacklist).toHaveBeenCalledWith($rootScope, searchBarController)
		})

		it("subscribe to fileStateService", () => {
			FileStateService.subscribe = jest.fn()

			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, searchBarController)
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		it("should set empty searchPattern", () => {
			searchBarController["_viewModel"].searchPattern = "*fileSettings"
			searchBarController.onFileSelectionStatesChanged(null)

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

	describe("onBlacklistChanged", () => {
		beforeEach(() => {
			searchBarController["_viewModel"].searchPattern = "/root/node/path"
		})

		it("should update ViewModel when pattern not blacklisted", () => {
			const blacklist: BlacklistItem[] = []

			searchBarController.onBlacklistChanged(blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeFalsy()
		})

		it("should update ViewModel when pattern excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/another/node/path", type: BlacklistType.exclude }
			]

			searchBarController.onBlacklistChanged(blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
		})

		it("should update ViewModel when pattern hidden and excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/node/path", type: BlacklistType.hide }
			]

			searchBarController.onBlacklistChanged(blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeTruthy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
		})
	})

	describe("isSearchPatternEmpty", () => {
		it("should return true, if SearchPattern is empty", () => {
			searchBarController["_viewModel"].searchPattern = ""

			expect(searchBarController.isSearchPatternEmpty()).toBeTruthy()
		})

		it("should return false, if SearchPattern is empty", () => {
			searchBarController["_viewModel"].searchPattern = "test"

			expect(searchBarController.isSearchPatternEmpty()).toBeFalsy()
		})
	})

	describe("onSearchPatternChanged", () => {
		it("call applySettingsSearchPattern", () => {
			searchBarController.applySettingsSearchPattern = jest.fn()

			searchBarController.onSearchPatternChanged()

			expect(searchBarController.applySettingsSearchPattern).toHaveBeenCalled()
		})

		it("call updateViewModel", () => {
			searchBarController.updateViewModel = jest.fn()

			searchBarController.onSearchPatternChanged()

			expect(searchBarController.updateViewModel).toHaveBeenCalled()
		})
	})

	describe("updateViewModel", () => {
		let blacklist: BlacklistItem[]

		beforeEach(() => {
			blacklist = [{ path: "/root/another/node/path", type: BlacklistType.exclude }]
			searchBarController["_viewModel"].searchPattern = "/root/node/path"
		})

		it("should set the isPatternHidden to true, when the pattern is already in Blacklist", () => {
			blacklist.push({ path: "/root/node/path", type: BlacklistType.hide })
			searchBarController["_viewModel"].isPatternHidden = false

			searchBarController["updateViewModel"](blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeTruthy()
		})

		it("should set the isPatternHidden to false, when the pattern is not in Blacklist", () => {
			searchBarController["_viewModel"].isPatternHidden = true

			searchBarController["updateViewModel"](blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
		})

		it("should set the isPatternExcluded to true, when the pattern is in Blacklist", () => {
			blacklist.push({ path: "/root/node/path", type: BlacklistType.exclude })
			searchBarController["_viewModel"].isPatternExcluded = false

			searchBarController["updateViewModel"](blacklist)

			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
		})

		it("should set the isPatternExcluded to false, when the pattern is not in Blacklist", () => {
			searchBarController["_viewModel"].isPatternExcluded = true

			searchBarController["updateViewModel"](blacklist)

			expect(searchBarController["_viewModel"].isPatternExcluded).toBeFalsy()
		})
	})
})
