import "./nodeContextMenu.module"

import { IRootScopeService, IWindowService, ITimeoutService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { NodeContextMenuController } from "./nodeContextMenu.component"
import { TEST_DELTA_MAP_A, VALID_NODE_WITH_PATH, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { BlacklistType, MarkedPackage, NodeType } from "../../codeCharta.model"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { FocusedNodePathService } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { MarkedPackagesService } from "../../state/store/fileSettings/markedPackages/markedPackages.service"
import { focusNode, unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { NodeDecorator } from "../../util/nodeDecorator"

describe("nodeContextMenuController", () => {
	let element: Element
	let nodeContextMenuController: NodeContextMenuController
	let $timeout: ITimeoutService
	let $window: IWindowService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapActionsService: CodeMapActionsService
	let codeMapPreRenderService: CodeMapPreRenderService

	beforeEach(() => {
		restartSystem()
		mockElement()
		mockWindow()
		withMockedCodeMapActionService()
		withMockedCodeMapPreRenderService()
		rebuildController()
		withMockedHideNodeContextMenuMethod()

		NodeDecorator.preDecorateFile(TEST_DELTA_MAP_A)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.nodeContextMenu")

		$timeout = getService<ITimeoutService>("$timeout")
		$window = getService<IWindowService>("$window")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
	}

	function mockElement() {
		element = [{ children: [{ clientWidth: 50, clientHeight: 100 }] }] as any
	}

	function mockWindow() {
		$window = { innerWidth: 800, innerHeight: 600 } as IWindowService
	}

	function rebuildController() {
		nodeContextMenuController = new NodeContextMenuController(
			element,
			$timeout,
			$window,
			$rootScope,
			storeService,
			codeMapActionsService,
			codeMapPreRenderService
		)
	}

	function withMockedCodeMapActionService() {
		codeMapActionsService.getParentMP = jest.fn()
		codeMapActionsService["anyEdgeIsVisible"] = jest.fn()
		codeMapActionsService.markFolder = jest.fn()
		codeMapActionsService.unmarkFolder = jest.fn()
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService.getRenderMap = jest.fn().mockReturnValue(TEST_DELTA_MAP_A.map)
	}

	function withMockedHideNodeContextMenuMethod() {
		nodeContextMenuController.hideNodeContextMenu = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to 'show-node-context-menu' events", () => {
			NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()

			rebuildController()

			expect(NodeContextMenuController.subscribeToShowNodeContextMenu).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
		})

		it("should subscribe focus-node-events", () => {
			NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()
			FocusedNodePathService.subscribeToFocusNode = jest.fn()

			rebuildController()

			expect(FocusedNodePathService.subscribeToFocusNode).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
		})

		it("should subscribe unfocus-node-events", () => {
			NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()
			FocusedNodePathService.subscribeToFocusNode = jest.fn()

			rebuildController()

			expect(FocusedNodePathService.subscribeToFocusNode).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
		})

		it("should subscribe blacklist events", () => {
			NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
		})

		it("should subscribe marked packages events", () => {
			NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()
			MarkedPackagesService.subscribe = jest.fn()

			rebuildController()

			expect(MarkedPackagesService.subscribe).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
		})

		it("should broadcast 'show-node-context-menu' when 'show' method is called", () => {
			withMockedEventMethods($rootScope)
			NodeContextMenuController.broadcastShowEvent($rootScope, "somepath", "sometype", 42, 24)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-node-context-menu", {
				path: "somepath",
				type: "sometype",
				x: 42,
				y: 24
			})
		})
	})

	describe("onFocusNode", () => {
		it("should hide the node context menu", () => {
			nodeContextMenuController.onFocusNode()

			expect(nodeContextMenuController.hideNodeContextMenu).toHaveBeenCalled()
		})
	})

	describe("onUnfocusNode", () => {
		it("should hide the node context menu", () => {
			nodeContextMenuController.onUnfocusNode()

			expect(nodeContextMenuController.hideNodeContextMenu).toHaveBeenCalled()
		})
	})

	describe("onBlacklistChanged", () => {
		it("should hide the node context menu", () => {
			nodeContextMenuController.onBlacklistChanged()

			expect(nodeContextMenuController.hideNodeContextMenu).toHaveBeenCalled()
		})
	})

	describe("onMarkedPackagesChanged", () => {
		it("should hide the node context menu", () => {
			nodeContextMenuController.onMarkedPackagesChanged()

			expect(nodeContextMenuController.hideNodeContextMenu).toHaveBeenCalled()
		})
	})

	describe("onShowNodeContextMenu", () => {
		beforeEach(() => {
			nodeContextMenuController.setPosition = jest.fn()
			nodeContextMenuController.calculatePosition = jest.fn().mockReturnValue({ x: 1, y: 2 })
			CodeMapHelper.getCodeMapNodeFromPath = jest.fn().mockReturnValue(TEST_DELTA_MAP_A.map)
		})

		it("should set the correct building after some timeout", () => {
			const path = "/root"
			const nodeType = NodeType.FOLDER

			nodeContextMenuController.onShowNodeContextMenu("/root", NodeType.FOLDER, 42, 24)

			expect(nodeContextMenuController["_viewModel"].codeMapNode).toEqual(TEST_DELTA_MAP_A.map)
			expect(CodeMapHelper.getCodeMapNodeFromPath).toHaveBeenCalledWith(path, nodeType, TEST_DELTA_MAP_A.map)
			expect(nodeContextMenuController.calculatePosition).toHaveBeenCalledWith(42, 24)
			expect(nodeContextMenuController.setPosition).toHaveBeenCalledTimes(1)
			expect(nodeContextMenuController.setPosition).toBeCalledWith(1, 2)
		})
	})

	describe("calculatePosition", () => {
		function testPositionCalculation(expectedX, expectedY, mouseX, mouseY) {
			const { x, y } = nodeContextMenuController.calculatePosition(mouseX, mouseY)
			expect(x).toBe(expectedX)
			expect(y).toBe(expectedY)
		}

		it("should calculate the position for the menu correctly, when it fits in the window", () => {
			testPositionCalculation(400, 300, 400, 300)
		})

		it("should calculate the position for the menu correctly, when it doesn't fit in the window.innerWidth", () => {
			testPositionCalculation(750, 300, 799, 300)
		})

		it("should calculate the position for the menu correctly, when it doesn't fit in the window.innerHeight", () => {
			testPositionCalculation(400, 500, 400, 599)
		})

		it("should calculate the position for the menu correctly, when it doesn't fit in the window.innerHeight and window.innerWidth", () => {
			testPositionCalculation(750, 500, 799, 599)
		})
	})

	describe("flattenNode", () => {
		it("should add flattened blacklistItem", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH.children[1]
			const expected = {
				path: "/root/Parent Leaf",
				type: BlacklistType.flatten
			}
			nodeContextMenuController.flattenNode()

			expect(storeService.getState().fileSettings.blacklist).toContainEqual(expected)
		})
	})

	describe("showNode", () => {
		it("should add flattened blacklistItem", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH.children[1]
			const expected = {
				path: "/root/Parent Leaf",
				type: BlacklistType.flatten
			}
			storeService.dispatch(addBlacklistItem(expected))

			nodeContextMenuController.showNode()

			expect(storeService.getState().fileSettings.blacklist).not.toContainEqual(expected)
		})
	})

	describe("clickColor", () => {
		it("should call unmarkFolder, if current folder is marked with color ", () => {
			nodeContextMenuController.isNodeOrParentMarked = jest.fn().mockReturnValue(true)
			nodeContextMenuController.unmarkFolder = jest.fn()

			nodeContextMenuController.clickColor("color")

			expect(nodeContextMenuController.isNodeOrParentMarked).toHaveBeenCalledWith("color")
			expect(nodeContextMenuController.unmarkFolder).toHaveBeenCalled()
		})

		it("should call markFolder, if current folder is not marked with color ", () => {
			nodeContextMenuController.isNodeOrParentMarked = jest.fn().mockReturnValue(false)
			nodeContextMenuController.markFolder = jest.fn()

			nodeContextMenuController.clickColor("color")

			expect(nodeContextMenuController.isNodeOrParentMarked).toHaveBeenCalledWith("color")
			expect(nodeContextMenuController.markFolder).toHaveBeenCalled()
		})
	})

	describe("currentFolderIsMarkedWithColor", () => {
		it("should return false, if color is undefined", () => {
			const result = nodeContextMenuController.isNodeOrParentMarked(undefined)

			expect(result).toBeFalsy()
		})

		it("should return false, if color is null", () => {
			const result = nodeContextMenuController.isNodeOrParentMarked(null)

			expect(result).toBeFalsy()
		})

		it("should return false, if _viewModel.contextMenuBuilding is undefined", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = undefined

			const result = nodeContextMenuController.isNodeOrParentMarked("color")

			expect(result).toBeFalsy()
		})

		it("should return false, if _viewModel.contextMenuBuilding is null", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = null

			const result = nodeContextMenuController.isNodeOrParentMarked("color")

			expect(result).toBeFalsy()
		})

		it("should return true, if package is marked and matches the color", () => {
			const markedPackages: MarkedPackage[] = [{ path: "/root", color: "color" }]
			storeService.dispatch(setMarkedPackages(markedPackages))

			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.isNodeOrParentMarked("color")

			expect(result).toBeTruthy()
		})

		it("should return false, if package is not marked and doesn't match the color of parent folder", () => {
			const markedPackages: MarkedPackage[] = [{ path: "/root", color: "color" }]
			storeService.dispatch(setMarkedPackages(markedPackages))

			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.isNodeOrParentMarked("another color")

			expect(result).toBeFalsy()
		})

		it("should return true, if package is marked and matches the color", () => {
			const markedPackages: MarkedPackage[] = [{ path: "/another root", color: "color" }]
			storeService.dispatch(setMarkedPackages(markedPackages))
			codeMapActionsService.getParentMP = jest.fn().mockReturnValue({ path: "/another root", color: "color" })

			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.isNodeOrParentMarked("color")

			expect(result).toBeTruthy()
			expect(codeMapActionsService.getParentMP).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].codeMapNode.path)
		})
	})

	describe("markFolder", () => {
		it("should call hide and codeMapActionService.markFolder", () => {
			nodeContextMenuController.markFolder("color")

			expect(codeMapActionsService.markFolder).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].codeMapNode, "color")
		})
	})

	describe("unmarkFolder", () => {
		it("should call hide and codeMapActionService.unmarkFolder", () => {
			nodeContextMenuController.unmarkFolder()

			expect(codeMapActionsService.unmarkFolder).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].codeMapNode)
		})
	})

	describe("focusNode", () => {
		beforeEach(() => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH.children[1]
		})

		it("should set new focused path", () => {
			nodeContextMenuController.focusNode()

			expect(storeService.getState().dynamicSettings.focusedNodePath).toEqual(VALID_NODE_WITH_PATH.children[1].path)
		})
	})

	describe("excludeNode", () => {
		beforeEach(() => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH.children[1]
		})

		it("should add exclude blacklistItem", () => {
			const expected = { path: "/root/Parent Leaf", type: BlacklistType.exclude }

			nodeContextMenuController.excludeNode()

			expect(storeService.getState().fileSettings.blacklist).toContainEqual(expected)
		})
	})

	describe("nodeIsFolder", () => {
		it("should return true, if contextMenuBuilding is a folder", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeTruthy()
		})

		it("should return false, if contextMenuBuilding is null", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = null
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})

		it("should return false, if contextMenuBuilding is undefined", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = undefined
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})

		it("should return false, if contextMenuBuilding has no children property", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH.children[0]
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})

		it("should return false, if contextMenuBuilding has children property but no children", () => {
			const VALID_NODE_WITHOUT_CHILDREN = VALID_NODE_WITH_PATH
			VALID_NODE_WITHOUT_CHILDREN.children[0].children = []

			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITHOUT_CHILDREN[0]
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})
	})

	describe("isNodeFocused", () => {
		it("should return true if a node is focused", () => {
			storeService.dispatch(focusNode("/root/big leaf"))
			nodeContextMenuController["_viewModel"].codeMapNode = TEST_DELTA_MAP_A.map.children[0]

			const actual = nodeContextMenuController.isNodeFocused()

			expect(actual).toBeTruthy()
		})

		it("should return false if a node is not focused", () => {
			storeService.dispatch(unfocusNode())
			nodeContextMenuController["_viewModel"].codeMapNode = TEST_DELTA_MAP_A.map.children[0]

			const actual = nodeContextMenuController.isNodeFocused()

			expect(actual).toBeFalsy()
		})
	})

	describe("isNodeOrParentFocused", () => {
		it("should return true if a node is focused", () => {
			storeService.dispatch(focusNode("/root/big leaf"))
			nodeContextMenuController["_viewModel"].codeMapNode = TEST_DELTA_MAP_A.map.children[0]

			const actual = nodeContextMenuController.isNodeOrParentFocused()

			expect(actual).toBeTruthy()
		})

		it("should return true if a parent of a node is focused", () => {
			storeService.dispatch(focusNode("/root/Parent Leaf"))
			nodeContextMenuController["_viewModel"].codeMapNode = TEST_DELTA_MAP_A.map.children[1].children[0]

			const actual = nodeContextMenuController.isNodeOrParentFocused()

			expect(actual).toBeTruthy()
		})

		it("should return false if a node is not focused", () => {
			storeService.dispatch(unfocusNode())
			nodeContextMenuController["_viewModel"].codeMapNode = TEST_DELTA_MAP_A.map.children[0]

			const actual = nodeContextMenuController.isNodeOrParentFocused()

			expect(actual).toBeFalsy()
		})
	})
})
