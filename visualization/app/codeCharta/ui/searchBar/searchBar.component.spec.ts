import "./searchBar.module"
import { SearchBarController } from "./searchBar.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { BlacklistItem, BlacklistType } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { withMockedEventMethods } from "../../util/dataMocks"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { SearchPatternService } from "../../state/store/dynamicSettings/searchPattern/searchPattern.service"
import { setSearchPattern } from "../../state/store/dynamicSettings/searchPattern/searchPattern.actions"

describe("SearchBarController", () => {
	let searchBarController: SearchBarController

	let $rootScope: IRootScopeService
	let storeService: StoreService
	const SOME_EXTRA_TIME = 100

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

		it("subscribe to searchPattern", () => {
			SearchPatternService.subscribe = jest.fn()

			rebuildController()

			expect(SearchPatternService.subscribe).toHaveBeenCalledWith($rootScope, searchBarController)
		})
	})

	describe("onSearchPatternChange", () => {
		it("should update the viewModel", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/another/node/path", type: BlacklistType.exclude }
			]
			storeService.dispatch(setBlacklist(blacklist))

			searchBarController.onSearchPatternChanged("/root/node/path")

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
			expect(searchBarController["_viewModel"].searchPattern).toBe("/root/node/path")
		})
	})

	describe("updateSearchPattern", () => {
		it("should set searchPattern in settings", () => {
			searchBarController["_viewModel"].searchPattern = "*fileSettings"
			searchBarController["updateSearchPattern"]()

			expect(storeService.getState().dynamicSettings.searchPattern).toBe(searchBarController["_viewModel"].searchPattern)
		})
	})

	describe("onClickBlacklistPattern", () => {
		it("should add new blacklist entry and clear searchPattern", () => {
			const blacklistItem = { path: "/root/node/path", type: BlacklistType.exclude }
			searchBarController["_viewModel"].searchPattern = blacklistItem.path
			storeService.dispatch(setSearchPattern(blacklistItem.path))

			searchBarController.onClickBlacklistPattern(blacklistItem.type)

			expect(storeService.getState().fileSettings.blacklist).toContainEqual(blacklistItem)
			expect(searchBarController["_viewModel"].searchPattern).toBe("")
			expect(storeService.getState().dynamicSettings.searchPattern).toBe("")
		})
	})

	describe("onBlacklistChanged", () => {
		beforeEach(() => {
			searchBarController["_viewModel"].searchPattern = "/root/node/path"
		})

		it("should update ViewModel when pattern not blacklisted", () => {
			const blacklist: BlacklistItem[] = []
			storeService.dispatch(setBlacklist())

			searchBarController.onBlacklistChanged(blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeFalsy()
		})

		it("should update ViewModel when pattern excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/another/node/path", type: BlacklistType.exclude }
			]
			storeService.dispatch(setBlacklist(blacklist))

			searchBarController.onBlacklistChanged(blacklist)

			expect(searchBarController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(searchBarController["_viewModel"].isPatternExcluded).toBeTruthy()
		})

		it("should update ViewModel when pattern hidden and excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/node/path", type: BlacklistType.flatten }
			]
			storeService.dispatch(setBlacklist(blacklist))

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

	describe("handleSearchPatternChange", () => {
		it("should update the searchPattern in state", done => {
			storeService.dispatch(setSearchPattern())
			searchBarController["_viewModel"].searchPattern = "*.ts"

			searchBarController.handleSearchPatternChange()

			setTimeout(() => {
				expect(storeService.getState().dynamicSettings.searchPattern).toBe("*.ts")
				done()
			}, SearchBarController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})
})
