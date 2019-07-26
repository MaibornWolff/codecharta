import "./mapTreeViewSearch.module"

import { SettingsService } from "../../state/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MapTreeViewSearchController } from "./mapTreeViewSearch.component"
import { FileStateService } from "../../state/fileState.service"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { TEST_FILE_WITH_PATHS, VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { CodeMapHelper } from "../../util/codeMapHelper"

describe("MapTreeViewSearchController", () => {
	let mapTreeViewSearchController: MapTreeViewSearchController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let fileStateService: FileStateService
	let codeMapActionsService: CodeMapActionsService
	let codeMapPreRenderService: CodeMapPreRenderService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedCodeMapPreRenderService()
		withMockedMapTreeViewSearch()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeViewSearch")
		;($rootScope = getService<IRootScopeService>("$rootScope")),
			(settingsService = getService<SettingsService>("settingsService")),
			(fileStateService = getService<FileStateService>("fileStateService")),
			(codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")),
			(codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService"))
	}

	function rebuildController() {
		mapTreeViewSearchController = new MapTreeViewSearchController(
			$rootScope,
			settingsService,
			codeMapActionsService,
			codeMapPreRenderService
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

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService["lastRender"].renderFile = TEST_FILE_WITH_PATHS
	}

	describe("onFileSelectionStatesChanged", () => {
		it("should set empty searchPattern", () => {
			mapTreeViewSearchController["_viewModel"].searchPattern = "*fileSettings"
			mapTreeViewSearchController.onFileSelectionStatesChanged(null, null)

			expect(mapTreeViewSearchController["_viewModel"].searchPattern).toBe("")
			expect(settingsService.getSettings().dynamicSettings.searchPattern).toBe("")
		})
	})

	describe("applySettingsSearchPattern", () => {
		it("should set searchPattern in settings", () => {
			mapTreeViewSearchController["_viewModel"].searchPattern = "*fileSettings"
			mapTreeViewSearchController.applySettingsSearchPattern()
			expect(settingsService.getSettings().dynamicSettings.searchPattern).toBe(
				mapTreeViewSearchController["_viewModel"].searchPattern
			)
		})
	})

	describe("onClickBlacklistPattern", () => {
		it("should add new blacklist entry and clear searchPattern", () => {
			const blacklistItem = { path: "/root/node/path", type: BlacklistType.exclude }
			mapTreeViewSearchController["_viewModel"].searchPattern = blacklistItem.path

			mapTreeViewSearchController.onClickBlacklistPattern(blacklistItem.type)

			expect(settingsService.getSettings().fileSettings.blacklist).toContainEqual(blacklistItem)
			expect(mapTreeViewSearchController["_viewModel"].searchPattern).toBe("")
		})
	})

	describe("isSearchPatternUpdated", () => {
		it("should return true because searchPattern was updated in settings", () => {
			const result = mapTreeViewSearchController["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "newPattern" } })
			expect(result).toEqual(true)
		})

		it("should return true because searchPattern was updated in settings with empty string", () => {
			const result = mapTreeViewSearchController["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "" } })
			expect(result).toEqual(true)
		})

		it("should return false because searchPattern was not updated in settings", () => {
			const result = mapTreeViewSearchController["isSearchPatternUpdated"]({ dynamicSettings: { margin: 42 } })
			expect(result).toEqual(false)
		})
	})

	describe("updateViewModel", () => {
		let searchedNodeLeaves: CodeMapNode[]
		let rootNode = VALID_NODE_WITH_PATH
		beforeEach(() => {
			mapTreeViewSearchController["_viewModel"].searchPattern = "/root/node/path"
		})

		it("should update ViewModel when pattern not blacklisted", () => {
			const blacklist: BlacklistItem[] = []
			mapTreeViewSearchController["updateViewModel"]([], blacklist)

			expect(mapTreeViewSearchController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(mapTreeViewSearchController["_viewModel"].isPatternExcluded).toBeFalsy()
		})

		it("should update ViewModel when pattern excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/another/node/path", type: BlacklistType.exclude }
			]
			mapTreeViewSearchController["updateViewModel"]([], blacklist)

			expect(mapTreeViewSearchController["_viewModel"].isPatternHidden).toBeFalsy()
			expect(mapTreeViewSearchController["_viewModel"].isPatternExcluded).toBeTruthy()
		})

		it("should update ViewModel when pattern hidden and excluded", () => {
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/node/path", type: BlacklistType.hide }
			]
			mapTreeViewSearchController["updateViewModel"]([], blacklist)

			expect(mapTreeViewSearchController["_viewModel"].isPatternHidden).toBeTruthy()
			expect(mapTreeViewSearchController["_viewModel"].isPatternExcluded).toBeTruthy()
		})

		it("should update ViewModel count Attributes when pattern hidden and excluded", () => {
			searchedNodeLeaves = [rootNode]
			searchedNodeLeaves[0].path = mapTreeViewSearchController["_viewModel"].searchPattern
			const blacklist: BlacklistItem[] = [
				{ path: "/root/node/path", type: BlacklistType.exclude },
				{ path: "/root/node/path", type: BlacklistType.hide }
			]

			// On Windows 'ignore' generates paths with backslashes instead of slashes when executing
			// the unit tests, and thus the test case fails without this mock.
			CodeMapHelper.isBlacklisted = jest.fn((node, blacklist, type) => {
				return (
					(type == BlacklistType.hide && node.path == "/root/node/path") ||
					(type == BlacklistType.exclude && node.path == "/root/node/path")
				)
			})

			mapTreeViewSearchController["updateViewModel"](searchedNodeLeaves, blacklist)

			expect(mapTreeViewSearchController["_viewModel"].fileCount).toEqual(searchedNodeLeaves.length)
			expect(mapTreeViewSearchController["_viewModel"].hideCount).toEqual(1)
			expect(mapTreeViewSearchController["_viewModel"].excludeCount).toEqual(1)
		})
	})

	describe("getSearchedNodeLeaves", () => {
		it("should return array of nodes leaves", () => {
			const rootNode = VALID_NODE_WITH_PATH
			mapTreeViewSearchController["searchedNodes"] = [
				rootNode,
				rootNode.children[0],
				rootNode.children[1].children[0],
				rootNode.children[1].children[1],
				rootNode.children[1].children[2]
			]
			const nodeLeaves = [
				rootNode.children[0],
				rootNode.children[1].children[0],
				rootNode.children[1].children[1],
				rootNode.children[1].children[2]
			]
			const result = mapTreeViewSearchController["getSearchedNodeLeaves"]()

			expect(result).toEqual(nodeLeaves)
		})
	})
})
