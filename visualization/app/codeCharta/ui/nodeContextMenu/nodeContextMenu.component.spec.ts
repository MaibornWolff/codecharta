import "./nodeContextMenu.module"

import { IRootScopeService, IWindowService } from "angular"
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
import { NodeDecorator } from "../../util/nodeDecorator"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { setIdToBuilding } from "../../state/store/lookUp/idToBuilding/idToBuilding.actions"
import { DialogService } from "../dialog/dialog.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

describe("nodeContextMenuController", () => {
	let element: Element
	let nodeContextMenuController: NodeContextMenuController
	let $window: IWindowService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapActionsService: CodeMapActionsService
	let codeMapPreRenderService: CodeMapPreRenderService
	let threeSceneService: ThreeSceneService
	let dialogService: DialogService
	let blacklistService: BlacklistService

	beforeEach(() => {
		restartSystem()
		mockElement()
		mockWindow()
		withMockedCodeMapActionService()
		withMockedCodeMapPreRenderService()
		withMockedThreeSceneService()
		rebuildController()

		NodeDecorator.decorateMapWithPathAttribute(TEST_DELTA_MAP_A)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.nodeContextMenu")

		$window = getService<IWindowService>("$window")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		dialogService = getService<DialogService>("dialogService")
		blacklistService = getService<BlacklistService>("blacklistService")
	}

	function mockElement() {
		// @ts-ignore we only care about few properties for the test.
		element = [{ children: [{ clientWidth: 50, clientHeight: 100 }] }]
	}

	function mockWindow() {
		$window = { innerWidth: 800, innerHeight: 600 } as IWindowService
	}

	function rebuildController() {
		nodeContextMenuController = new NodeContextMenuController(
			element,
			$window,
			$rootScope,
			storeService,
			codeMapActionsService,
			codeMapPreRenderService,
			threeSceneService,
			dialogService,
			blacklistService
		)
	}

	function withMockedCodeMapActionService() {
		codeMapActionsService.markFolder = jest.fn()
		codeMapActionsService.unmarkFolder = jest.fn()
	}

	function withMockedCodeMapPreRenderService() {
		codeMapPreRenderService.getRenderMap = jest.fn().mockReturnValue(TEST_DELTA_MAP_A.map)
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
			const documentAddEventListenerSpy = jest.spyOn(document, "addEventListener")
			rebuildController()

			expect(documentAddEventListenerSpy).toHaveBeenCalledWith(
				"building-right-clicked",
				nodeContextMenuController.onBuildingRightClicked
			)
		})
	})

	describe("onShowNodeContextMenu", () => {
		let mockedWheelTargetElement
		beforeEach(() => {
			nodeContextMenuController.setPosition = jest.fn()
			nodeContextMenuController.calculatePosition = jest.fn().mockReturnValue({ x: 1, y: 2 })

			document.body.addEventListener = jest.fn()
			mockedWheelTargetElement = { addEventListener: jest.fn(), removeEventListener: jest.fn() }
			// @ts-ignore
			jest.spyOn(document, "getElementById").mockImplementation(() => mockedWheelTargetElement)
		})

		it("should set the correct building after some timeout", () => {
			nodeContextMenuController.onShowNodeContextMenu("/root", NodeType.FOLDER, 42, 24)

			expect(nodeContextMenuController["_viewModel"].codeMapNode).toEqual(TEST_DELTA_MAP_A.map)
			expect(nodeContextMenuController["_viewModel"].showNodeContextMenu).toBe(true)
			expect(nodeContextMenuController.calculatePosition).toHaveBeenCalledWith(42, 24)
			expect(nodeContextMenuController.setPosition).toHaveBeenCalledTimes(1)
			expect(nodeContextMenuController.setPosition).toBeCalledWith(1, 2)

			expect(document.body.addEventListener).toHaveBeenNthCalledWith(1, "click", expect.anything(), expect.anything())
			expect(document.body.addEventListener).toHaveBeenNthCalledWith(2, "mousedown", expect.anything(), expect.anything())

			expect(document.getElementById).toHaveBeenCalledWith("codeMap")
			expect(mockedWheelTargetElement.addEventListener).toHaveBeenCalledWith("wheel", expect.anything(), expect.anything())
		})

		it("should not shorten the path if it has no sub paths", () => {
			nodeContextMenuController.onShowNodeContextMenu("/root", NodeType.FOLDER, 42, 24)

			expect(nodeContextMenuController["_viewModel"].nodePath).toEqual(TEST_DELTA_MAP_A.map.path)
			expect(nodeContextMenuController["_viewModel"].lastPartOfNodePath).toBe(TEST_DELTA_MAP_A.map.path)
		})

		it("should set the complete and shortened node path", () => {
			nodeContextMenuController.onShowNodeContextMenu("/root/big leaf", NodeType.FILE, 521, 588)
			const nodePath = TEST_DELTA_MAP_A.map.children[0].path

			expect(nodeContextMenuController["_viewModel"].nodePath).toEqual(nodePath)
			expect(nodeContextMenuController["_viewModel"].lastPartOfNodePath).toBe(`...${nodePath.slice(nodePath.lastIndexOf("/"))}`)
		})

		it("should remove all listener on hide", () => {
			const documentRemoveEventListenerSpy = jest.spyOn(document.body, "removeEventListener")

			nodeContextMenuController.onHideNodeContextMenu()

			expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith(
				"click",
				nodeContextMenuController.onBodyLeftClickHideNodeContextMenu,
				true
			)
			expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith(
				"mousedown",
				nodeContextMenuController.onBodyRightClickHideNodeContextMenu,
				true
			)
			expect(mockedWheelTargetElement.removeEventListener).toHaveBeenCalledWith(
				"wheel",
				nodeContextMenuController.onMapWheelHideNodeContextMenu,
				true
			)
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
				nodeType: NodeType.FOLDER,
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

			expect(storeService.getState().fileSettings.blacklist).not.toContain(expected)
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

	describe("excludeNode", () => {
		beforeEach(() => {
			nodeContextMenuController["_viewModel"].codeMapNode = VALID_NODE_WITH_PATH.children[1]
		})

		it("should add exclude blacklistItem", () => {
			blacklistService.resultsInEmptyMap = jest.fn(() => false)
			const expected = { nodeType: "Folder", path: "/root/Parent Leaf", type: BlacklistType.exclude }

			nodeContextMenuController.excludeNode()

			expect(storeService.getState().fileSettings.blacklist).toContainEqual(expected)
		})

		it("should display error dialog when no files are left", () => {
			blacklistService.resultsInEmptyMap = jest.fn(() => true)
			dialogService.showErrorDialog = jest.fn()

			nodeContextMenuController.excludeNode()

			expect(dialogService.showErrorDialog).toBeCalled()
		})

		it("should prevent duplicate blacklist object regarding issue #2419", () => {
			blacklistService.resultsInEmptyMap = jest.fn(() => false)

			nodeContextMenuController.excludeNode()
			nodeContextMenuController.excludeNode()

			expect(storeService.getState().fileSettings.blacklist.length).toEqual(1)
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

	describe("onBodyLeftClickHideNodeContextMenu", () => {
		it("should not hide if a click on color-picker tricker occurs", () => {
			const broadcastHideEventSpy = jest.spyOn(NodeContextMenuController, "broadcastHideEvent")
			const mockedMouseEvent: any = {
				composedPath: () => [{ nodeName: "CC-MARK-FOLDER-COLOR-PICKER" }]
			}
			nodeContextMenuController.onBodyLeftClickHideNodeContextMenu(mockedMouseEvent)

			expect(broadcastHideEventSpy).not.toHaveBeenCalled()
		})

		it("should not hide if a click within color-picker occurs", () => {
			const broadcastHideEventSpy = jest.spyOn(NodeContextMenuController, "broadcastHideEvent")
			const mockedMouseEvent: any = {
				composedPath: () => [{ nodeName: "COLOR-CHROME" }]
			}
			nodeContextMenuController.onBodyLeftClickHideNodeContextMenu(mockedMouseEvent)

			expect(broadcastHideEventSpy).not.toHaveBeenCalled()
		})

		it("should hide if clicked somewhere but not within the color-picker", () => {
			const broadcastHideEventSpy = jest.spyOn(NodeContextMenuController, "broadcastHideEvent")
			const mockedMouseEvent: any = {
				composedPath: () => [{ nodeName: "DIV" }]
			}
			nodeContextMenuController.onBodyLeftClickHideNodeContextMenu(mockedMouseEvent)

			expect(broadcastHideEventSpy).toHaveBeenCalled()
		})
	})
})
