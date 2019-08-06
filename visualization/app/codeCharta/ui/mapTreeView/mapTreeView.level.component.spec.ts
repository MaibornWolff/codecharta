import "./mapTreeView.module"

import { MapTreeViewLevelController } from "./mapTreeView.level.component"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { SettingsService } from "../../state/settings.service"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { Node } from "../../codeCharta.model"
import { CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapNode, BlacklistType, MarkedPackage } from "../../codeCharta.model"
import { VALID_NODE_WITH_PATH } from "../../util/dataMocks"

describe("MapTreeViewLevelController", () => {
	let mapTreeViewLevelController: MapTreeViewLevelController
	let $rootScope: IRootScopeService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService
	let $event

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")

		$event = {
			clientX: jest.fn(),
			clientY: jest.fn()
		}
	}

	function rebuildController() {
		mapTreeViewLevelController = new MapTreeViewLevelController($rootScope, codeMapActionsService, settingsService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
		$rootScope.$digest = jest.fn()
		$rootScope.$on = jest.fn()
	}

	describe("Listen to code map hovering", () => {
		function buildNodeAt(path: string): CodeMapNode {
			return ({ path: "somePath" } as any) as CodeMapNode
		}

		function buildTransitionTo(path: string): CodeMapBuildingTransition {
			const hoveredCodeMapBuilding: CodeMapBuilding = ({ node: ({ path: path } as any) as Node } as any) as CodeMapBuilding
			return { from: null, to: hoveredCodeMapBuilding }
		}

		it("should set _isHoveredInCodeMap to true if hovered node path from the event is the same as the node path assigned to this controller", () => {
			const controllerNode: CodeMapNode = buildNodeAt("somePath")
			const transition: CodeMapBuildingTransition = buildTransitionTo("somePath")
			mapTreeViewLevelController["node"] = controllerNode
			mapTreeViewLevelController.onBuildingHovered(transition)
			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(true)
		})

		it("should set _isHoveredInCodeMap to false if hovered node path from the event is not the same as the node path assigned to this controller", () => {
			const controllerNode: CodeMapNode = buildNodeAt("somePath")
			const transition: CodeMapBuildingTransition = buildTransitionTo("someOtherPath")
			mapTreeViewLevelController["node"] = controllerNode
			mapTreeViewLevelController.onBuildingHovered(transition)
			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(false)
		})

		it("should set _isHoveredInCodeMap to false if hovered node is null", () => {
			const transition: CodeMapBuildingTransition = { from: null, to: null }
			mapTreeViewLevelController.onBuildingHovered(transition)
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
				settingsService.getSettings().fileSettings.blacklist,
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
})
