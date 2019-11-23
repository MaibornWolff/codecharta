import "./mapTreeView.module"

import { MapTreeViewLevelController } from "./mapTreeView.level.component"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapNode, BlacklistType, MarkedPackage } from "../../codeCharta.model"
import { VALID_NODE_WITH_PATH, CODE_MAP_BUILDING, VALID_NODE_WITH_METRICS, VALID_NODE_WITH_ROOT_UNARY } from "../../util/dataMocks"
import _ from "lodash"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"

describe("MapTreeViewLevelController", () => {
	let mapTreeViewLevelController: MapTreeViewLevelController
	let $rootScope: IRootScopeService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService
	let codeMapPreRenderService: CodeMapPreRenderService
	let storeService: StoreService
	let $event

	beforeEach(() => {
		restartSystem()
		withMockedCodeMapPreRenderService()
		rebuildController()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
		storeService = getService<StoreService>("storeService")

		$event = {
			clientX: jest.fn(),
			clientY: jest.fn()
		}
	}

	function rebuildController() {
		mapTreeViewLevelController = new MapTreeViewLevelController(
			$rootScope,
			codeMapActionsService,
			settingsService,
			codeMapPreRenderService,
			storeService
		)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
		$rootScope.$digest = jest.fn()
		$rootScope.$on = jest.fn()
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService = jest.fn<CodeMapPreRenderService>(() => {
			return {
				getRenderMap: jest.fn().mockReturnValue(VALID_NODE_WITH_ROOT_UNARY)
			}
		})()
	}

	describe("Listen to code map hovering", () => {
		let codeMapBuilding: CodeMapBuilding
		let codeMapNode: CodeMapNode

		beforeEach(() => {
			codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
			codeMapBuilding.node.path = "somePath"

			codeMapNode = _.cloneDeep(VALID_NODE_WITH_PATH)
			codeMapNode.path = "somePath"
		})

		it("should set _isHoveredInCodeMap to true if hovered node path from the event is the same as the node path assigned to this controller", () => {
			mapTreeViewLevelController["node"] = codeMapNode
			mapTreeViewLevelController.onBuildingHovered(codeMapBuilding)
			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(true)
		})

		it("should set _isHoveredInCodeMap to false if hovered node path from the event is not the same as the node path assigned to this controller", () => {
			const differentCodeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
			differentCodeMapBuilding.node.path = "someOtherPath"
			mapTreeViewLevelController["node"] = codeMapNode
			mapTreeViewLevelController.onBuildingHovered(differentCodeMapBuilding)
			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(false)
		})

		it("should set _isHoveredInCodeMap to false if unhovered", () => {
			mapTreeViewLevelController.onBuildingUnhovered()
			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(false)
		})

		it("Black color if no folder", () => {
			mapTreeViewLevelController["node"] = { path: "/root/node/path", type: "File" } as CodeMapNode
			expect(mapTreeViewLevelController.getMarkingColor()).toBe("#000000")
		})

		it("Return the markinColor if the matching markedPackage", () => {
			mapTreeViewLevelController["node"] = { path: "/root/node/path", type: "Folder" } as CodeMapNode
			mapTreeViewLevelController["settingsService"]["settings"].fileSettings.markedPackages = [
				{
					path: "/root/node/path",
					color: "#123FDE"
				} as MarkedPackage
			]
			expect(mapTreeViewLevelController.getMarkingColor()).toBe("#123FDE")
		})

		it("Return black if no markingColor in node", () => {
			mapTreeViewLevelController["node"] = { path: "/root/node/path", type: "Folder" } as CodeMapNode
			mapTreeViewLevelController["settingsService"]["settings"].fileSettings.markedPackages = []
			expect(mapTreeViewLevelController.getMarkingColor()).toBe("#000000")
		})
	})

	describe("Mouse movement", () => {
		it("Mouse enter", () => {
			mapTreeViewLevelController.onMouseEnter()
			expect($rootScope.$broadcast).toHaveBeenCalledWith("should-hover-node", mapTreeViewLevelController["node"])
		})

		it("Mouse leave", () => {
			mapTreeViewLevelController.onMouseLeave()
			expect($rootScope.$broadcast).toHaveBeenCalledWith("should-unhover-node", mapTreeViewLevelController["node"])
		})
	})

	describe("Clicks behaviour", () => {
		it("Right click", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", "Folder", VALID_NODE_WITH_PATH)
			let context = {
				path: mapTreeViewLevelController["node"].path,
				type: mapTreeViewLevelController["node"].type,
				x: $event.clientX,
				y: $event.clientY
			}
			mapTreeViewLevelController.onRightClick($event)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("hide-node-context-menu")
			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-node-context-menu", context)
		})

		it("Folder click collapse", () => {
			mapTreeViewLevelController["_viewModel"].collapsed = true
			mapTreeViewLevelController.onFolderClick()
			expect(mapTreeViewLevelController["_viewModel"].collapsed).toBeFalsy()
		})

		it("Folder click uncollapse", () => {
			mapTreeViewLevelController["_viewModel"].collapsed = false
			mapTreeViewLevelController.onFolderClick()
			expect(mapTreeViewLevelController["_viewModel"].collapsed).toBeTruthy()
		})

		it("Label click", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", "Folder", VALID_NODE_WITH_PATH)
			mapTreeViewLevelController["codeMapActionsService"].focusNode = jest.fn()
			mapTreeViewLevelController.onLabelClick()

			expect(mapTreeViewLevelController["codeMapActionsService"].focusNode).toHaveBeenCalledWith(mapTreeViewLevelController["node"])
		})

		it("Eye click", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", "Folder", VALID_NODE_WITH_PATH)
			mapTreeViewLevelController["codeMapActionsService"].toggleNodeVisibility = jest.fn()
			mapTreeViewLevelController.onEyeClick()

			expect(mapTreeViewLevelController["codeMapActionsService"].toggleNodeVisibility).toHaveBeenCalledWith(
				mapTreeViewLevelController["node"]
			)
		})

		it("Is leaf", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/small leaf",
				"File",
				VALID_NODE_WITH_PATH
			)
			expect(mapTreeViewLevelController.isLeaf()).toBeTruthy()
		})

		it("Is not leaf", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", "Folder", VALID_NODE_WITH_PATH)
			expect(mapTreeViewLevelController.isLeaf(mapTreeViewLevelController["node"])).toBeFalsy()
		})

		it("Is blacklisted", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/empty folder",
				"Folder",
				VALID_NODE_WITH_PATH
			)

			CodeMapHelper.isBlacklisted = jest.fn()
			mapTreeViewLevelController.isBlacklisted(mapTreeViewLevelController["node"])

			expect(CodeMapHelper.isBlacklisted).toHaveBeenCalledWith(
				mapTreeViewLevelController["node"],
				storeService.getState().fileSettings.blacklist,
				BlacklistType.exclude
			)
		})

		it("Not blacklisted, not exist", () => {
			CodeMapHelper.isBlacklisted = jest.fn()
			let blacklisted = mapTreeViewLevelController.isBlacklisted(mapTreeViewLevelController["node"])
			expect(blacklisted).toBeFalsy()
		})

		it("Is searched", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/empty folder",
				"Folder",
				VALID_NODE_WITH_PATH
			)
			mapTreeViewLevelController["settingsService"]["settings"].dynamicSettings.searchedNodePaths = [
				"/root/Parent Leaf/",
				"/root/Parent Leaf/empty folder"
			]
			let searched = mapTreeViewLevelController.isSearched(mapTreeViewLevelController["node"])
			expect(searched).toBeTruthy()
		})

		it("Is not searched", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/empty folder",
				"Folder",
				VALID_NODE_WITH_PATH
			)
			mapTreeViewLevelController["settingsService"]["settings"].dynamicSettings.searchedNodePaths = ["/root/Parent Leaf"]
			let searched = mapTreeViewLevelController.isSearched(mapTreeViewLevelController["node"])
			expect(searched).toBeFalsy()
		})

		it("Is not searched with null parameter", () => {
			let searched = mapTreeViewLevelController.isSearched(null)
			expect(searched).toBeFalsy()
		})

		it("Sort leaf", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/small leaf",
				"File",
				VALID_NODE_WITH_PATH
			)
			let sortValue = mapTreeViewLevelController.sortByFolder(mapTreeViewLevelController["node"])
			expect(sortValue).toBe(0)
		})

		it("Sort not a leaf", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath("/root/Parent Leaf", "Folder", VALID_NODE_WITH_PATH)
			let sortValue = mapTreeViewLevelController.sortByFolder(mapTreeViewLevelController["node"])
			expect(sortValue).toBe(1)
		})

		it("Hover", () => {
			mapTreeViewLevelController.onMouseEnter()

			expect($rootScope.$on).toHaveBeenCalled
		})

		it("Unhover", () => {
			mapTreeViewLevelController.onMouseLeave()

			expect($rootScope.$on).toHaveBeenCalled
		})
	})
	describe("openRootFolderByDefault", () => {
		it("should set the collapsed variable to false, if depth size is 0", () => {
			mapTreeViewLevelController["_viewModel"].collapsed = true

			mapTreeViewLevelController.openRootFolderByDefault(0)

			expect(mapTreeViewLevelController["_viewModel"].collapsed).toBeFalsy()
		})
		it("should do nothing, if the depth size is not 0", () => {
			mapTreeViewLevelController["_viewModel"].collapsed = true

			mapTreeViewLevelController.openRootFolderByDefault(5)

			expect(mapTreeViewLevelController["_viewModel"].collapsed).toBeTruthy()
		})
		it("should do nothing, if the depth size is not 0 and the collapsed variable is false", () => {
			mapTreeViewLevelController["_viewModel"].collapsed = false

			mapTreeViewLevelController.openRootFolderByDefault(5)

			expect(mapTreeViewLevelController["_viewModel"].collapsed).toBeFalsy()
		})
	})
	describe("getNodeUnary", () => {
		it("should return the unary of the current node", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_METRICS

			const nodeUnary = mapTreeViewLevelController.getNodeUnary()

			expect(nodeUnary).toBe(VALID_NODE_WITH_METRICS.attributes["unary"])
		})
	})
	describe("getUnaryPercentage", () => {
		it("should return the Child Node Unary-Percentage to 50 percent", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_ROOT_UNARY.children[0]

			const nodePercentage = mapTreeViewLevelController.getUnaryPercentage()

			expect(nodePercentage).toBe("50")
		})
		it("should return the Root-Node Unary-Precentage to 100 percent", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_ROOT_UNARY

			const nodePercentage = mapTreeViewLevelController.getUnaryPercentage()

			expect(nodePercentage).toBe("100")
		})
	})
	describe("isRoot", () => {
		it("should return that the current Node is a Root", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_ROOT_UNARY

			const isRootNode = mapTreeViewLevelController.isRoot()

			expect(isRootNode).toBeTruthy()
		})
		it("should return that the current Node is not Root", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_ROOT_UNARY.children[0]

			const isRootNode = mapTreeViewLevelController.isRoot()

			expect(isRootNode).toBeFalsy()
		})
	})
})
