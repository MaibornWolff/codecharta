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
import { addBlacklistItem, setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"

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
		rebuildController()
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
		element = jest.fn<Element>(() => {
			return [
				{
					children: [
						{
							clientWidth: 50,
							clientHeight: 100
						}
					]
				}
			]
		})()
	}

	function mockWindow() {
		$window = jest.fn<IWindowService>(() => {
			return {
				innerWidth: 800,
				innerHeight: 600
			}
		})()
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

	function withMockedSubscribeMethods() {
		NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()
		NodeContextMenuController.subscribeToHideNodeContextMenu = jest.fn()
	}

	function withMockedCodeMapActionService() {
		codeMapActionsService = nodeContextMenuController["codeMapActionsService"] = jest.fn<CodeMapActionsService>(() => {
			return {
				getParentMP: jest.fn(),
				anyEdgeIsVisible: jest.fn(),
				markFolder: jest.fn(),
				unmarkFolder: jest.fn()
			}
		})()
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService = nodeContextMenuController["codeMapPreRenderService"] = jest.fn<CodeMapPreRenderService>(() => {
			return {
				getRenderMap: jest.fn(() => {
					return TEST_DELTA_MAP_A.map
				})
			}
		})()
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("event related behavior", () => {
		it("should subscribe to 'show-node-context-menu' events", () => {
			withMockedSubscribeMethods()
			withMockedEventMethods($rootScope)
			rebuildController()
			expect(NodeContextMenuController.subscribeToShowNodeContextMenu).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
		})

		it("should subscribe to 'hide-node-context-menu' events", () => {
			withMockedSubscribeMethods()
			withMockedEventMethods($rootScope)
			rebuildController()
			expect(NodeContextMenuController.subscribeToHideNodeContextMenu).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
		})

		it("should broadcast 'show-node-context-menu' when 'show' method is called", () => {
			withMockedSubscribeMethods()
			withMockedEventMethods($rootScope)
			NodeContextMenuController.broadcastShowEvent($rootScope, "somepath", "sometype", 42, 24)
			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-node-context-menu", {
				path: "somepath",
				type: "sometype",
				x: 42,
				y: 24
			})
		})

		it("should broadcast 'hide-node-context-menu' when 'hide' method is called", () => {
			withMockedSubscribeMethods()
			withMockedEventMethods($rootScope)
			NodeContextMenuController.broadcastHideEvent($rootScope)
			expect($rootScope.$broadcast).toHaveBeenCalledWith("hide-node-context-menu")
		})
	})

	describe("show", () => {
		beforeEach(() => {
			withMockedCodeMapActionService()
			withMockedCodeMapPreRenderService()
			nodeContextMenuController.setPosition = jest.fn()
			nodeContextMenuController.calculatePosition = jest.fn().mockReturnValue({ x: 1, y: 2 })
			CodeMapHelper.getCodeMapNodeFromPath = jest.fn().mockReturnValue(TEST_DELTA_MAP_A.map)
		})

		it("should set the correct building after some timeout", () => {
			const path = "/root"
			const nodeType = NodeType.FOLDER

			nodeContextMenuController.onShowNodeContextMenu("/root", NodeType.FOLDER, 42, 24)
			$timeout.flush(100)
			expect(nodeContextMenuController["_viewModel"].contextMenuBuilding).toEqual(TEST_DELTA_MAP_A.map)
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
			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH.children[1]
			const expected = {
				path: "/root/Parent Leaf",
				type: BlacklistType.flatten
			}
			storeService.dispatch(setBlacklist([]))

			nodeContextMenuController.flattenNode()
			$timeout.flush()

			expect(storeService.getState().fileSettings.blacklist).toContainEqual(expected)
		})
	})

	describe("showNode", () => {
		it("should add flattened blacklistItem", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH.children[1]
			const expected = {
				path: "/root/Parent Leaf",
				type: BlacklistType.flatten
			}
			storeService.dispatch(addBlacklistItem(expected))

			nodeContextMenuController.showNode()
			$timeout.flush()

			expect(storeService.getState().fileSettings.blacklist).not.toContainEqual(expected)
		})
	})

	describe("clickColor", () => {
		it("should call unmarkFolder, if current folder is marked with color ", () => {
			nodeContextMenuController.currentFolderIsMarkedWithColor = jest.fn().mockReturnValue(true)
			nodeContextMenuController.unmarkFolder = jest.fn()

			nodeContextMenuController.clickColor("color")

			expect(nodeContextMenuController.currentFolderIsMarkedWithColor).toHaveBeenCalledWith("color")
			expect(nodeContextMenuController.unmarkFolder).toHaveBeenCalled()
		})

		it("should call markFolder, if current folder is not marked with color ", () => {
			nodeContextMenuController.currentFolderIsMarkedWithColor = jest.fn().mockReturnValue(false)
			nodeContextMenuController.markFolder = jest.fn()

			nodeContextMenuController.clickColor("color")

			expect(nodeContextMenuController.currentFolderIsMarkedWithColor).toHaveBeenCalledWith("color")
			expect(nodeContextMenuController.markFolder).toHaveBeenCalled()
		})
	})

	describe("currentFolderIsMarkedWithColor", () => {
		it("should return false, if color is undefined", () => {
			const result = nodeContextMenuController.currentFolderIsMarkedWithColor(undefined)

			expect(result).toBeFalsy()
		})

		it("should return false, if color is null", () => {
			const result = nodeContextMenuController.currentFolderIsMarkedWithColor(null)

			expect(result).toBeFalsy()
		})

		it("should return false, if _viewModel.contextMenuBuilding is undefined", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = undefined

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("color")

			expect(result).toBeFalsy()
		})

		it("should return false, if _viewModel.contextMenuBuilding is null", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = null

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("color")

			expect(result).toBeFalsy()
		})

		it("should return true, if package is marked and matches the color", () => {
			const markedPackages: MarkedPackage[] = [{ path: "/root", color: "color", attributes: [] }]
			storeService.dispatch(setMarkedPackages(markedPackages))

			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("color")

			expect(result).toBeTruthy()
		})

		it("should return false, if package is not marked and doesn't match the color of parent folder", () => {
			const markedPackages: MarkedPackage[] = [{ path: "/root", color: "color", attributes: [] }]
			storeService.dispatch(setMarkedPackages(markedPackages))

			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("another color")

			expect(result).toBeFalsy()
		})

		it("should return true, if package is marked and matches the color", () => {
			const markedPackages: MarkedPackage[] = [{ path: "/another root", color: "color", attributes: [] }]
			storeService.dispatch(setMarkedPackages(markedPackages))
			codeMapActionsService.getParentMP = jest.fn().mockReturnValue({ path: "/another root", color: "color" })

			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("color")

			expect(result).toBeTruthy()
			expect(codeMapActionsService.getParentMP).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].contextMenuBuilding.path)
		})
	})

	describe("markFolder", () => {
		beforeEach(() => {
			codeMapActionsService.markFolder = jest.fn()
		})

		it("should hide contextMenu", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()

			nodeContextMenuController.markFolder("color")

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
		})

		it("should call hide and codeMapActionService.markFolder", () => {
			nodeContextMenuController.markFolder("color")

			expect(codeMapActionsService.markFolder).toHaveBeenCalledWith(
				nodeContextMenuController["_viewModel"].contextMenuBuilding,
				"color"
			)
		})
	})

	describe("unmarkFolder", () => {
		beforeEach(() => {
			codeMapActionsService.unmarkFolder = jest.fn()
		})

		it("should hide contextMenu", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()

			nodeContextMenuController.unmarkFolder()

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
		})

		it("should call hide and codeMapActionService.unmarkFolder", () => {
			nodeContextMenuController.unmarkFolder()

			expect(codeMapActionsService.unmarkFolder).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].contextMenuBuilding)
		})
	})

	describe("focusNode", () => {
		beforeEach(() => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH.children[1]
		})

		it("should hide contextMenu", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()

			nodeContextMenuController.focusNode()

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
		})

		it("should set new focused path", () => {
			nodeContextMenuController.focusNode()

			expect(storeService.getState().dynamicSettings.focusedNodePath).toEqual(VALID_NODE_WITH_PATH.children[1].path)
		})
	})

	describe("excludeNode", () => {
		beforeEach(() => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH.children[1]
		})

		it("should hide contextMenu", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()

			nodeContextMenuController.excludeNode()

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
		})

		it("should add exclude blacklistItem", () => {
			const expected = { path: "/root/Parent Leaf", type: BlacklistType.exclude }

			nodeContextMenuController.excludeNode()

			expect(storeService.getState().fileSettings.blacklist).toContainEqual(expected)
		})
	})

	describe("nodeIsFolder", () => {
		it("should return true, if contextMenuBuilding is a folder", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeTruthy()
		})

		it("should return false, if contextMenuBuilding is null", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = null
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})

		it("should return false, if contextMenuBuilding is undefined", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = undefined
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})

		it("should return false, if contextMenuBuilding has no children property", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH.children[0]
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})

		it("should return false, if contextMenuBuilding has children property but no children", () => {
			const VALID_NODE_WITHOUT_CHILDREN = VALID_NODE_WITH_PATH
			VALID_NODE_WITHOUT_CHILDREN.children[0].children = []

			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITHOUT_CHILDREN[0]
			const result = nodeContextMenuController.nodeIsFolder()

			expect(result).toBeFalsy()
		})
	})

	describe("hide", () => {
		it("should set contextMenuBuilding to null after flush", () => {
			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH
			nodeContextMenuController.onHideNodeContextMenu()
			$timeout.flush()

			expect(nodeContextMenuController["_viewModel"].contextMenuBuilding).toBe(null)
		})
	})
})
