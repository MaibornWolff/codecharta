import "./searchBar.module"
import { SearchBarController } from "./searchBar.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FileStateService } from "../../state/fileState.service"
import { BlacklistItem, BlacklistType } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { withMockedEventMethods } from "../../util/dataMocks"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { addBlacklistItem, setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"

describe("SearchBarController", () => {
	let searchBarController: SearchBarController

	let $rootScope: IRootScopeService
	let storeService: StoreService
	let SOME_EXTRA_TIME = 100

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.searchBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		searchBarController = new SearchBarController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("subscribe to blacklist", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, searchBarController)
		})

		it("subscribe to fileStateService", () => {
			FileStateService.subscribe = jest.fn()

			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, searchBarController)
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		it("should set empty searchPattern", done => {
			searchBarController["_viewModel"].searchPattern = "*fileSettings"
			searchBarController.onFileSelectionStatesChanged(null)

			expect(searchBarController["_viewModel"].searchPattern).toBe("")

			setTimeout(() => {
				expect(storeService.getState().dynamicSettings.searchPattern).toEqual("")
				done()
			}, SearchBarController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})

	describe("applySettingsSearchPattern", () => {
		it("should set searchPattern in settings", () => {
			searchBarController["_viewModel"].searchPattern = "*fileSettings"
			searchBarController["applySettingsSearchPattern"]()

			expect(storeService.getState().dynamicSettings.searchPattern).toEqual(searchBarController["_viewModel"].searchPattern)
		})
	})

	describe("onClickBlacklistPattern", () => {
		it("should add new blacklist entry and clear searchPattern", () => {
			const blacklistItem = { path: "/root/node/path", type: BlacklistType.exclude }
			searchBarController["_viewModel"].searchPattern = blacklistItem.path

			searchBarController.onClickBlacklistPattern(blacklistItem.type)

			expect(storeService.getState().fileSettings.blacklist).toContainEqual(blacklistItem)
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
				{ path: "/root/node/path", type: BlacklistType.flatten }
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
		let flatten: BlacklistItem
		let excluded: BlacklistItem
		let flattenNotInPattern: BlacklistItem
		let excludedNotInPattern: BlacklistItem

		beforeEach(() => {
			const path = "/root/node/path"
			const notInPattern = "/root/foo/node/path"
			flatten = { path, type: BlacklistType.flatten }
			excluded = { path, type: BlacklistType.exclude }
			flattenNotInPattern = { path: notInPattern, type: BlacklistType.flatten }
			excludedNotInPattern = { path: notInPattern, type: BlacklistType.exclude }

			searchBarController["_viewModel"].searchPattern = path

			storeService.dispatch(setBlacklist())
		})

		it("should set the isPatternHidden to true, when the pattern is already in Blacklist", () => {
			storeService.dispatch(addBlacklistItem(flatten))

			searchBarController.onSearchPatternChanged()

			expect(searchBarController["_viewModel"].isPatternHidden).toBeTruthy()
		})

		it("should set the isPatternHidden to false, when the pattern is not in Blacklist", () => {
			storeService.dispatch(addBlacklistItem(flattenNotInPattern))

			searchBarController.onSearchPatternChanged()

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
		})

		it("should set the isPatternExcluded to true, when the pattern is in Blacklist", () => {
			storeService.dispatch(addBlacklistItem(excluded))

			searchBarController.onSearchPatternChanged()

			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
		})

		it("should set the isPatternExcluded to false, when the pattern is not in Blacklist", () => {
			storeService.dispatch(addBlacklistItem(excludedNotInPattern))

			searchBarController.onSearchPatternChanged()

			expect(searchBarController["_viewModel"].isPatternExcluded).toBeFalsy()
		})

		it("should set the searchPattern in store", done => {
			searchBarController.onSearchPatternChanged()

			setTimeout(() => {
				expect(storeService.getState().dynamicSettings.searchPattern).toEqual("/root/node/path")
				done()
			}, SearchBarController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})
})
