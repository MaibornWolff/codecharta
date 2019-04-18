import "./mapTreeViewSearch.module"

import { SettingsService } from "../../state/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MapTreeViewSearchController } from "./mapTreeViewSearch.component"
import { FileStateService } from "../../state/fileState.service"
import { BlacklistItem, BlacklistType } from "../../codeCharta.model"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapRenderService } from "../codeMap/codeMap.render.service"
import { TEST_FILE_WITH_PATHS, VALID_NODE_WITH_PATH } from "../../util/dataMocks"

describe("MapTreeViewSearchController", () => {

	let mapTreeViewSearchController: MapTreeViewSearchController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let fileStateService: FileStateService
	let codeMapActionsService: CodeMapActionsService
	let codeMapRenderService: CodeMapRenderService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedCodeMapRenderService()
		withMockedMapTreeViewSearch()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeViewSearch")

		$rootScope = getService<IRootScopeService>("$rootScope"),
		settingsService = getService<SettingsService>("settingsService"),
		fileStateService = getService<FileStateService>("fileStateService"),
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService"),
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")
	}

	function rebuildController() {
		mapTreeViewSearchController = new MapTreeViewSearchController($rootScope, settingsService,
			codeMapActionsService, codeMapRenderService
		)
	}

	function withMockedMapTreeViewSearch() {
		mapTreeViewSearchController["_viewModel"] = {
			searchPattern: "",
			fileCount: 0,
			excludeCount: 0,
			hideCount: 0,
			isPatternExcluded: false,
			isPatternHidden: false
		}
	}

	function withMockedCodeMapRenderService() {
		codeMapRenderService["lastRender"].renderFile = TEST_FILE_WITH_PATHS
	}

	it("should set searchPattern in settings", () => {
		mapTreeViewSearchController["_viewModel"].searchPattern = "*fileSettings"
		mapTreeViewSearchController.applySettingsSearchPattern()
		expect(settingsService.getSettings().dynamicSettings.searchPattern).toBe(
			mapTreeViewSearchController["_viewModel"].searchPattern
		)
	})

	it("should add new blacklist entry and clear searchPattern", () => {
		const blacklistItem = { path: "/root/node/path", type: BlacklistType.exclude }
		mapTreeViewSearchController["_viewModel"].searchPattern = blacklistItem.path

		mapTreeViewSearchController.onClickBlacklistPattern(blacklistItem.type)

		expect(settingsService.getSettings().fileSettings.blacklist).toContainEqual(blacklistItem)
		expect(mapTreeViewSearchController["_viewModel"].searchPattern).toBe("")
	})

	it("should updateViewModel when pattern not blacklisted", () => {
		settingsService.settings.fileSettings.blacklist = []
		mapTreeViewSearchController["_viewModel"].searchPattern = "/root/node/path"

		mapTreeViewSearchController["updateViewModel"]()
		expect(mapTreeViewSearchController["_viewModel"].isPatternHidden).toBeFalsy()
		expect(mapTreeViewSearchController["_viewModel"].isPatternExcluded).toBeFalsy()
	})

	it("should updateViewModel when pattern excluded", () => {
		const blacklistItem = { path: "/root/node/path", type: BlacklistType.exclude }
		const anotherBlacklistItem = { path: "/root/another/node/path", type: BlacklistType.exclude }
		settingsService.settings.fileSettings.blacklist = [blacklistItem, anotherBlacklistItem]
		mapTreeViewSearchController["_viewModel"].searchPattern = "/root/node/path"

		mapTreeViewSearchController["updateViewModel"]()
		expect(mapTreeViewSearchController["_viewModel"].isPatternHidden).toBeFalsy()
		expect(mapTreeViewSearchController["_viewModel"].isPatternExcluded).toBeTruthy()
	})

	it("should updateViewModel when pattern hidden and excluded", () => {
		const blacklistItemExcluded = { path: "/root/node/path", type: BlacklistType.exclude }
		const blacklistItemHidden = { path: "/root/node/path", type: BlacklistType.hide }
		settingsService.settings.fileSettings.blacklist = [blacklistItemExcluded, blacklistItemHidden]
		mapTreeViewSearchController["_viewModel"].searchPattern = "/root/node/path"

		mapTreeViewSearchController["updateViewModel"]()
		expect(mapTreeViewSearchController["_viewModel"].isPatternHidden).toBeTruthy()
		expect(mapTreeViewSearchController["_viewModel"].isPatternExcluded).toBeTruthy()
	})

	describe("Update ViewModel with blacklist count", () => {
		let file1, file2, folder1, folder2, blacklist: BlacklistItem[]

		beforeEach(() => {
			file1 = VALID_NODE_WITH_PATH.children[1].children[0]
			file2 = VALID_NODE_WITH_PATH.children[0]
			folder1 = VALID_NODE_WITH_PATH.children[1].children[2]
			folder2 = VALID_NODE_WITH_PATH.children[1]
			CodeMapHelper.getNodesByGitignorePath = jest.fn(() => {
				return [file1, file2, folder1]
			})

			blacklist = [
				{ path: file1.path, type: BlacklistType.hide },
				{ path: file1.path, type: BlacklistType.exclude },
				{ path: folder2.path, type: BlacklistType.hide },
				{ path: file2.path, type: BlacklistType.exclude }
			]
		})

		it("should get correct searchedNodePaths with searchedFiles.length", () => {
			mapTreeViewSearchController["setSearchedNodePathNames"]()

			expect(settingsService.settings.dynamicSettings.searchedNodePaths).toEqual([
				"/root/Parent Leaf/small leaf",
				"/root/big leaf",
				"/root/Parent Leaf/empty folder"
			])
			expect(mapTreeViewSearchController["searchedFiles"].length).toBe(3)
		})

		it("should have correct fileCount", () => {
			settingsService.settings.fileSettings.blacklist = blacklist

			mapTreeViewSearchController["setSearchedNodePathNames"]()

			expect(mapTreeViewSearchController["_viewModel"].fileCount).toBe(3)
		})

		it("should calculate correct hideCount and excludeCount", () => {
			rebuildController()

			const isBlacklisted = jest.fn()
			isBlacklisted.mockImplementation((node, blacklist, type) => {
				if (type == BlacklistType.hide && node.path == "/root/big leaf") return true
				if (type == BlacklistType.exclude && (node.path == "/root/big leaf" || node.path == "/root/Parent Leaf/small leaf"))
					return true
				return false
			})
			CodeMapHelper.isBlacklisted = isBlacklisted.bind(CodeMapHelper)

			mapTreeViewSearchController["setSearchedNodePathNames"]()

			expect(mapTreeViewSearchController["_viewModel"].hideCount).toBe(1)
			expect(mapTreeViewSearchController["_viewModel"].excludeCount).toBe(2)
		})
	})
})
