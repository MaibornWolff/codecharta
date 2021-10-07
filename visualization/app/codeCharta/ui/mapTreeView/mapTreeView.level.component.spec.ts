import "./mapTreeView.module"

import { MapTreeViewLevelController } from "./mapTreeView.level.component"
import { getCodeMapNodeFromPath } from "../../util/codeMapHelper"
import { IRootScopeService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { NodeType } from "../../codeCharta.model"
import { VALID_NODE_WITH_PATH, VALID_NODE_WITH_METRICS, VALID_NODE_WITH_ROOT_UNARY, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { setSearchedNodePaths } from "../../state/store/dynamicSettings/searchedNodePaths/searchedNodePaths.actions"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"

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

	describe("openNodeContextMenu", () => {
		it("should open NodeContextMenu and mark the folder", () => {
			document.getElementById = jest.fn().mockReturnValue({ addEventListener: jest.fn() })
			mapTreeViewLevelController["node"] = getCodeMapNodeFromPath("/root/Parent Leaf", NodeType.FOLDER, VALID_NODE_WITH_PATH)
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
			mapTreeViewLevelController["node"] = getCodeMapNodeFromPath("/root/Parent Leaf/small leaf", NodeType.FILE, VALID_NODE_WITH_PATH)

			expect(mapTreeViewLevelController.isLeaf()).toBeTruthy()
		})

		it("should not be a leaf", () => {
			mapTreeViewLevelController["node"] = getCodeMapNodeFromPath("/root/Parent Leaf", NodeType.FOLDER, VALID_NODE_WITH_PATH)

			const result = mapTreeViewLevelController.isLeaf(mapTreeViewLevelController["node"])

			expect(result).toBeFalsy()
		})
	})

	describe("isSearched", () => {
		it("should be searched", () => {
			mapTreeViewLevelController["node"] = getCodeMapNodeFromPath(
				"/root/Parent Leaf/empty folder",
				NodeType.FOLDER,
				VALID_NODE_WITH_PATH
			)
			storeService.dispatch(setSearchedNodePaths(new Set(["/root/Parent Leaf/", "/root/Parent Leaf/empty folder"])))

			const result = mapTreeViewLevelController.isSearched()

			expect(result).toBeTruthy()
		})

		it("should not be searched", () => {
			mapTreeViewLevelController["node"] = getCodeMapNodeFromPath(
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
