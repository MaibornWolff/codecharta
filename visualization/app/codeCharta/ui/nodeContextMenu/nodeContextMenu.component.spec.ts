import "./nodeContextMenu.module"

import { IRootScopeService, IWindowService, ITimeoutService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { NodeContextMenuController } from "./nodeContextMenu.component"
import {
	CODE_MAP_BUILDING,
	CODE_MAP_BUILDING_TS_NODE,
	CONSTANT_HIGHLIGHT,
	TEST_DELTA_MAP_A,
	VALID_FILE_NODE_WITH_ID,
	VALID_NODE_WITH_PATH,
	withMockedEventMethods
} from "../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"
import { StoreService } from "../../state/store.service"
import { setMarkedPackages } from "../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { BlacklistType, MarkedPackage, NodeType } from "../../codeCharta.model"
import { addBlacklistItem } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { focusNode, unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { NodeDecorator } from "../../util/nodeDecorator"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { setIdToBuilding } from "../../state/store/lookUp/idToBuilding/idToBuilding.actions"

describe("nodeContextMenuController", () => {
	let element: Element
	let nodeContextMenuController: NodeContextMenuController
	let $timeout: ITimeoutService
	let $window: IWindowService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapActionsService: CodeMapActionsService
	let codeMapPreRenderService: CodeMapPreRenderService
	let threeSceneService: ThreeSceneService

	beforeEach(() => {
		restartSystem()
		mockElement()
		mockWindow()
		withMockedCodeMapActionService()
		withMockedCodeMapPreRenderService()
		withMockedThreeSceneService()
		rebuildController()
		withMockedHideNodeContextMenuMethod()

		NodeDecorator.decorateMapWithPathAttribute(TEST_DELTA_MAP_A)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.nodeContextMenu")

		$timeout = getService<ITimeoutService>("$timeout")
		$window = getService<IWindowService>("$window")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
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
			codeMapPreRenderService,
			threeSceneService
		)
	}

	function withMockedCodeMapActionService() {
		codeMapActionsService.markFolder = jest.fn()
		codeMapActionsService.unmarkFolder = jest.fn()
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService.getRenderMap = jest.fn().mockReturnValue(TEST_DELTA_MAP_A.map)
	}

	function withMockedHideNodeContextMenuMethod() {
		nodeContextMenuController.onHideNodeContextMenu = jest.fn()
	}

	function withMockedThreeSceneService() {
		threeSceneService = jest.fn().mockReturnValue({
			addNodeAndChildrenToConstantHighlight: jest.fn(),
			removeNodeAndChildrenFromConstantHighlight: jest.fn(),
			getConstantHighlight: jest.fn().mockReturnValue(CONSTANT_HIGHLIGHT)
		})()
	}

	describe("constructor", () => {
		it("should subscribe to 'show-node-context-menu' events", () => {
			NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()

			rebuildController()

			expect(NodeContextMenuController.subscribeToShowNodeContextMenu).toHaveBeenCalledWith($rootScope, nodeContextMenuController)
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

		it("should subscribe to 'on-building-right-clicked' events", () => {
			NodeContextMenuController.subscribeToShowNodeContextMenu = jest.fn()
			CodeMapMouseEventService.subscribeToBuildingRightClickedEvents = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingRightClickedEvents).toHaveBeenCalledWith(
				$rootScope,
				nodeContextMenuController
			)
		})
	})

	describe("onShowNodeContextMenu", () => {
		beforeEach(() => {
			nodeContextMenuController.setPosition = jest.fn()
			nodeContextMenuController.calculatePosition = jest.fn().mockReturnValue({ x: 1, y: 2 })
		})

		it("should set the correct building after some timeout", () => {
			document.body.addEventListener = jest.fn()

			const elementMock = { addEventListener: jest.fn() }
			// @ts-ignore
			jest.spyOn(document, "getElementById").mockImplementation(() => elementMock)

			nodeContextMenuController.onShowNodeContextMenu("/root", NodeType.FOLDER, 42, 24)

			expect(nodeContextMenuController["_viewModel"].codeMapNode).toEqual(TEST_DELTA_MAP_A.map)
			expect(nodeContextMenuController["_viewModel"].showNodeContextMenu).toBe(true)
			expect(nodeContextMenuController.calculatePosition).toHaveBeenCalledWith(42, 24)
			expect(nodeContextMenuController.setPosition).toHaveBeenCalledTimes(1)
			expect(nodeContextMenuController.setPosition).toBeCalledWith(1, 2)

			expect(document.body.addEventListener).toHaveBeenNthCalledWith(1, "click", expect.anything(), expect.anything())
			expect(document.body.addEventListener).toHaveBeenNthCalledWith(2, "mousedown", expect.anything(), expect.anything())

			expect(document.getElementById).toHaveBeenCalledWith("codeMap")
			expect(elementMock.addEventListener).toHaveBeenCalledWith("wheel", expect.anything(), expect.anything())
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

	describe("removeNodeFromConstantHighlight", () => {
		it("should call addNodeandChildrenToConstantHighlight", () => {
			nodeContextMenuController.addNodeToConstantHighlight()

			expect(threeSceneService.addNodeAndChildrenToConstantHighlight).toHaveBeenCalled()
		})
	})

	describe("addNodeToConstantHighlight", () => {
		it("should call addNodeandChildrenToConstantHighlight", () => {
			nodeContextMenuController.removeNodeFromConstantHighlight()

			expect(threeSceneService.removeNodeAndChildrenFromConstantHighlight).toHaveBeenCalled()
		})
	})

	describe("isNodeConstantlyHighlighted", () => {
		beforeEach(() => {
			const idToBuilding = new Map<number, CodeMapBuilding>()
			idToBuilding.set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)
			idToBuilding.set(CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE)
			storeService.dispatch(setIdToBuilding(idToBuilding))
		})
		it("should return false if codeMapNode is not existing", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = null

			const result = nodeContextMenuController.isNodeConstantlyHighlighted()

			expect(result).toEqual(false)
		})

		it("should return false if codeMapNode exists but is not in constant Highlight", () => {
			threeSceneService.getConstantHighlight = jest.fn().mockReturnValue(new Map())
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_FILE_NODE_WITH_ID

			const result = nodeContextMenuController.isNodeConstantlyHighlighted()

			expect(threeSceneService.getConstantHighlight).toHaveBeenCalled()
			expect(result).toEqual(false)
		})

		it("should return true if codeMapNode exists and in constant Highlight", () => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_FILE_NODE_WITH_ID

			const result = nodeContextMenuController.isNodeConstantlyHighlighted()

			expect(result).toEqual(true)
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

			nodeContextMenuController.showFlattenedNode()

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
			const result = nodeContextMenuController.isNodeOrParentMarked()

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

	describe("onBodyLeftClickHideNodeContextMenu", () => {
		it("should not hide if a click on color-picker occurs", () => {
			const broadcastHideEventSpy = jest.spyOn(NodeContextMenuController, "broadcastHideEvent")
			const mockedMouseEvent = {
				composedPath: () => [{ nodeName: "CC-NODE-CONTEXT-MENU-COLOR-PICKER" }]
			} as any
			nodeContextMenuController.onBodyLeftClickHideNodeContextMenu(mockedMouseEvent)

			expect(broadcastHideEventSpy).not.toHaveBeenCalled()
		})

		it("should hide if clicked somewhere but not within the color-picker", () => {
			const broadcastHideEventSpy = jest.spyOn(NodeContextMenuController, "broadcastHideEvent")
			const mockedMouseEvent = {
				composedPath: () => [{ nodeName: "DIV" }]
			} as any
			nodeContextMenuController.onBodyLeftClickHideNodeContextMenu(mockedMouseEvent)

			expect(broadcastHideEventSpy).toHaveBeenCalled()
		})
	})
})
