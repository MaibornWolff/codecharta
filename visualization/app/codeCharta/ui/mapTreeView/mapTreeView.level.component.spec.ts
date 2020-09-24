import "./mapTreeView.module"

import { MapTreeViewLevelController } from "./mapTreeView.level.component"
import { IRootScopeService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapNode, MarkedPackage } from "../../codeCharta.model"
import { VALID_NODE_WITH_PATH, CODE_MAP_BUILDING, withMockedEventMethods, decorateFiles } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { setSearchedNodePaths } from "../../state/store/dynamicSettings/searchedNodePaths/searchedNodePaths.actions"
import { clone } from "../../util/clone"
import _ from "lodash"

describe("MapTreeViewLevelController", () => {
	let mapTreeViewLevelController: MapTreeViewLevelController
	let $rootScope: IRootScopeService
	let codeMapPreRenderService: CodeMapPreRenderService
	let storeService: StoreService
	let $event

	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		withMockedCodeMapPreRenderService()
		withMockedEventMethods($rootScope)
		rebuildController()

		mapTreeViewLevelController["node"] = map
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
		map = decorateFiles()[0].map
	}

	function rebuildController() {
		mapTreeViewLevelController = new MapTreeViewLevelController($rootScope, codeMapPreRenderService, storeService)
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService.getRenderMap = jest.fn().mockReturnValue(map)
	}

	describe("onBuildingHovered", () => {
		let codeMapBuilding: CodeMapBuilding
		let codeMapNode: CodeMapNode

		beforeEach(() => {
			codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
			codeMapBuilding.node.path = "somePath"

			codeMapNode = clone(VALID_NODE_WITH_PATH)
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
	})

	describe("getMarkingColor", () => {
		it("should return black color if no folder", () => {
			mapTreeViewLevelController["node"] = map.children[0]

			const result = mapTreeViewLevelController.getMarkingColor()

			expect(result).toBe("#000000")
		})

		it("should return the markingColor if the matching markedPackage", () => {
			mapTreeViewLevelController["node"] = map.children[1]
			const markedPackages: MarkedPackage[] = [
				{
					path: map.children[1].path,
					color: "#123FDE"
				}
			]
			storeService.dispatch(setMarkedPackages(markedPackages))

			const result = mapTreeViewLevelController.getMarkingColor()

			expect(result).toBe("#123FDE")
		})

		it("should return black if no markingColor in node", () => {
			mapTreeViewLevelController["node"] = map.children[1]
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
			mapTreeViewLevelController["node"] = map.children[1]
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
			mapTreeViewLevelController["node"] = map.children[0]

			expect(mapTreeViewLevelController.isLeaf()).toBeTruthy()
		})

		it("should not be a leaf", () => {
			mapTreeViewLevelController["node"] = map.children[1]

			const result = mapTreeViewLevelController.isLeaf(mapTreeViewLevelController["node"])

			expect(result).toBeFalsy()
		})
	})

	describe("isSearched", () => {
		it("should be searched", () => {
			mapTreeViewLevelController["node"] = map.children[0]
			storeService.dispatch(setSearchedNodePaths(new Set([map.children[0].path])))

			const result = mapTreeViewLevelController.isSearched()

			expect(result).toBeTruthy()
		})

		it("should not be searched", () => {
			mapTreeViewLevelController["node"] = map.children[0]
			storeService.dispatch(setSearchedNodePaths(new Set()))

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

	describe("getNumberOfFiles", () => {
		it("should return the number of descendants of the current node", () => {
			const result = mapTreeViewLevelController.getNumberOfFiles()

			expect(result).toBe(3)
		})
	})

	describe("getNumberOfFilesPercentage", () => {
		it("should return the percentage relative to the number of total nodes", () => {
			mapTreeViewLevelController["node"] = map.children[1]

			const result = mapTreeViewLevelController.getNumberOfFilesPercentage()

			expect(result).toBe("67")
		})

		it("should return 100% for the root node", () => {
			const result = mapTreeViewLevelController.getNumberOfFilesPercentage()

			expect(result).toBe("100")
		})
	})

	describe("isRoot", () => {
		it("should return that the current Node is a Root", () => {
			const result = mapTreeViewLevelController.isRoot()

			expect(result).toBeTruthy()
		})

		it("should return that the current Node is not Root", () => {
			mapTreeViewLevelController["node"] = map.children[0]

			const result = mapTreeViewLevelController.isRoot()

			expect(result).toBeFalsy()
		})
	})
})
