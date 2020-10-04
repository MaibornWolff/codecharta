import "./mapTreeView.module"

import { MapTreeViewLevelController } from "./mapTreeView.level.component"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapNode, MarkedPackage, NodeType } from "../../codeCharta.model"
import {
	VALID_NODE_WITH_PATH,
	CODE_MAP_BUILDING,
	VALID_NODE_WITH_METRICS,
	VALID_NODE_WITH_ROOT_UNARY,
	withMockedEventMethods
} from "../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { setSearchedNodePaths } from "../../state/store/dynamicSettings/searchedNodePaths/searchedNodePaths.actions"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { klona } from 'klona';

describe("MapTreeViewLevelController", () => {
	let mapTreeViewLevelController: MapTreeViewLevelController
	let $rootScope: IRootScopeService
	let codeMapPreRenderService: CodeMapPreRenderService
	let storeService: StoreService
	let $event

	beforeEach(() => {
		restartSystem()
		withMockedCodeMapPreRenderService()
		withMockedEventMethods($rootScope)
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.mapTreeView")

		$rootScope = getService<IRootScopeService>("$rootScope")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
		storeService = getService<StoreService>("storeService")
		$event = {
			clientX: jest.fn(),
			clientY: jest.fn(),
			stopPropagation: jest.fn()
		}
	}

	function rebuildController() {
		mapTreeViewLevelController = new MapTreeViewLevelController($rootScope, codeMapPreRenderService, storeService)
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService.getRenderMap = jest.fn().mockReturnValue(VALID_NODE_WITH_ROOT_UNARY)
	}

	describe("onBuildingHovered", () => {
		let codeMapBuilding: CodeMapBuilding
		let codeMapNode: CodeMapNode

		beforeEach(() => {
			codeMapBuilding = klona(CODE_MAP_BUILDING)
			codeMapBuilding.node.path = "somePath"

			codeMapNode = klona(VALID_NODE_WITH_PATH)
			codeMapNode.path = "somePath"
		})

		it("should set _isHoveredInCodeMap to true if hovered node path from the event is the same as the node path assigned to this controller", () => {
			mapTreeViewLevelController["node"] = codeMapNode

			mapTreeViewLevelController.onBuildingHovered(codeMapBuilding)

			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(true)
		})

		it("should set _isHoveredInCodeMap to false if hovered node path from the event is not the same as the node path assigned to this controller", () => {
			const differentCodeMapBuilding = klona(CODE_MAP_BUILDING)
			differentCodeMapBuilding.node.path = "someOtherPath"
			mapTreeViewLevelController["node"] = codeMapNode

			mapTreeViewLevelController.onBuildingHovered(differentCodeMapBuilding)

			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(false)
		})

		it("should set _isHoveredInCodeMap to false if unhovered", () => {
			mapTreeViewLevelController.onBuildingUnhovered()

			expect(mapTreeViewLevelController["_viewModel"].isHoveredInCodeMap).toBe(false)
		})
	})

	describe("getMarkingColor", () => {
		it("should return black color if no folder", () => {
			mapTreeViewLevelController["node"] = { path: "/root/node/path", type: NodeType.FILE } as CodeMapNode

			const result = mapTreeViewLevelController.getMarkingColor()

			expect(result).toBe("#000000")
		})

		it("should return the markingColor if the matching markedPackage", () => {
			mapTreeViewLevelController["node"] = { path: "/root/node/path", type: NodeType.FOLDER } as CodeMapNode
			const markedMackages = [
				{
					path: "/root/node/path",
					color: "#123FDE"
				} as MarkedPackage
			]
			storeService.dispatch(setMarkedPackages(markedMackages))

			const result = mapTreeViewLevelController.getMarkingColor()

			expect(result).toBe("#123FDE")
		})

		it("should return black if no markingColor in node", () => {
			mapTreeViewLevelController["node"] = { path: "/root/node/path", type: NodeType.FOLDER } as CodeMapNode
			storeService.dispatch(setMarkedPackages([]))

			const result = mapTreeViewLevelController.getMarkingColor()

			expect(result).toBe("#000000")
		})
	})

	describe("onMouseEnter", () => {
		it("should broadcast should-hover-node", () => {
			mapTreeViewLevelController.onMouseEnter()

			expect($rootScope.$broadcast).toHaveBeenCalledWith("should-hover-node", mapTreeViewLevelController["node"])
		})
	})

	describe("onMouseLeave", () => {
		it("should broadcast should-unhover-node", () => {
			mapTreeViewLevelController.onMouseLeave()

			expect($rootScope.$broadcast).toHaveBeenCalledWith("should-unhover-node", mapTreeViewLevelController["node"])
		})
	})

	describe("openNodeContextMenu", () => {
		it("should open NodeContextMenu and mark the folder", () => {
			document.getElementById = jest.fn().mockReturnValue({ addEventListener: jest.fn() })
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf",
				NodeType.FOLDER,
				VALID_NODE_WITH_PATH
			)
			const context = {
				path: mapTreeViewLevelController["node"].path,
				type: mapTreeViewLevelController["node"].type,
				x: $event.clientX,
				y: $event.clientY
			}

			mapTreeViewLevelController.openNodeContextMenu($event)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-node-context-menu", context)
			expect(mapTreeViewLevelController["_viewModel"].isMarked).toBeTruthy()
		})
	})

	describe("isLeaf", () => {
		it("should be a leaf", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/small leaf",
				NodeType.FILE,
				VALID_NODE_WITH_PATH
			)

			expect(mapTreeViewLevelController.isLeaf()).toBeTruthy()
		})

		it("should not be a leaf", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf",
				NodeType.FOLDER,
				VALID_NODE_WITH_PATH
			)

			const result = mapTreeViewLevelController.isLeaf(mapTreeViewLevelController["node"])

			expect(result).toBeFalsy()
		})
	})

	describe("isSearched", () => {
		it("should be searched", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/empty folder",
				NodeType.FOLDER,
				VALID_NODE_WITH_PATH
			)
			storeService.dispatch(setSearchedNodePaths(new Set(["/root/Parent Leaf/", "/root/Parent Leaf/empty folder"])))

			const result = mapTreeViewLevelController.isSearched()

			expect(result).toBeTruthy()
		})

		it("should not be searched", () => {
			mapTreeViewLevelController["node"] = CodeMapHelper.getCodeMapNodeFromPath(
				"/root/Parent Leaf/empty folder",
				NodeType.FOLDER,
				VALID_NODE_WITH_PATH
			)
			storeService.dispatch(setSearchedNodePaths(new Set(["/root/Parent Leaf"])))

			const result = mapTreeViewLevelController.isSearched()

			expect(result).toBeFalsy()
		})

		it("should not be searched with null parameter", () => {
			mapTreeViewLevelController["node"] = null

			const result = mapTreeViewLevelController.isSearched()

			expect(result).toBeFalsy()
		})
	})

	describe("openRootFolderByDefault", () => {
		it("should set the isFolderOpened variable to false, if depth size is 0", () => {
			mapTreeViewLevelController["_viewModel"].isFolderOpened = false

			mapTreeViewLevelController.openRootFolderByDefault(0)

			expect(mapTreeViewLevelController["_viewModel"].isFolderOpened).toBeTruthy()
		})

		it("should do nothing, if the depth size is not 0", () => {
			mapTreeViewLevelController["_viewModel"].isFolderOpened = false

			mapTreeViewLevelController.openRootFolderByDefault(5)

			expect(mapTreeViewLevelController["_viewModel"].isFolderOpened).toBeFalsy()
		})

		it("should do nothing, if the depth size is not 0 and the isFolderOpened variable is true", () => {
			mapTreeViewLevelController["_viewModel"].isFolderOpened = true

			mapTreeViewLevelController.openRootFolderByDefault(5)

			expect(mapTreeViewLevelController["_viewModel"].isFolderOpened).toBeTruthy()
		})
	})

	describe("getNodeUnaryValue", () => {
		it("should return the unary of the current node", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_METRICS

			const result = mapTreeViewLevelController.getNodeUnaryValue()

			expect(result).toBe(VALID_NODE_WITH_METRICS.attributes[NodeMetricDataService.UNARY_METRIC])
		})
	})

	describe("getUnaryPercentage", () => {
		it("should return the Child Node Unary-Percentage to 50 percent", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_ROOT_UNARY.children[0]

			const result = mapTreeViewLevelController.getUnaryPercentage()

			expect(result).toBe("50")
		})

		it("should return the Root-Node Unary-Precentage to 100 percent", () => {
			mapTreeViewLevelController["node"] = VALID_NODE_WITH_ROOT_UNARY

			const result = mapTreeViewLevelController.getUnaryPercentage()

			expect(result).toBe("100")
		})
	})
})
