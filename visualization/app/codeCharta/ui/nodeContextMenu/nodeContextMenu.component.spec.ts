import "./nodeContextMenu.module"

import { IRootScopeService, IWindowService, ITimeoutService } from "angular"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { NodeContextMenuController } from "./nodeContextMenu.component"
import { TEST_DELTA_MAP_A, VALID_NODE_WITH_PATH } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap/codeMap.preRender.service"

describe("nodeContextMenuController", () => {
	let element: Element
	let nodeContextMenuController: NodeContextMenuController
	let $timeout: ITimeoutService
	let $window: IWindowService
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
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
		settingsService = getService<SettingsService>("settingsService")
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
			codeMapActionsService,
			settingsService,
			codeMapPreRenderService
		)
	}

	function withMockedEventMethods() {
		$rootScope.$on = nodeContextMenuController["$rootScope"].$on = jest.fn()
		$rootScope.$broadcast = nodeContextMenuController["$rootScope"].$broadcast = jest.fn()
	}

	function withMockedCodeMapActionService() {
		codeMapActionsService = nodeContextMenuController["codeMapActionsService"] = jest.fn<CodeMapActionsService>(() => {
			return {
				getParentMP: jest.fn(),
				anyEdgeIsVisible: jest.fn(),
				hideNode: jest.fn(),
				markFolder: jest.fn(),
				unmarkFolder: jest.fn(),
				focusNode: jest.fn(),
				excludeNode: jest.fn()
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
			withMockedEventMethods()
			rebuildController()
			expect($rootScope.$on).toHaveBeenCalledWith("show-node-context-menu", expect.any(Function))
		})

		it("should subscribe to 'hide-node-context-menu' events", () => {
			withMockedEventMethods()
			rebuildController()
			expect($rootScope.$on).toHaveBeenCalledWith("hide-node-context-menu", expect.any(Function))
		})

		it("should broadcast 'show-node-context-menu' when 'show' method is called", () => {
			withMockedEventMethods()
			NodeContextMenuController.broadcastShowEvent($rootScope, "somepath", "sometype", 42, 24)
			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-node-context-menu", {
				path: "somepath",
				type: "sometype",
				x: 42,
				y: 24
			})
		})

		it("should broadcast 'hide-node-context-menu' when 'hide' method is called", () => {
			withMockedEventMethods()
			NodeContextMenuController.broadcastHideEvent($rootScope)
			expect($rootScope.$broadcast).toHaveBeenCalledWith("hide-node-context-menu")
		})

		it("should call 'showContextMenu' on 'show-node-context-menu' events", () => {
			nodeContextMenuController.onShowNodeContextMenu = jest.fn()
			NodeContextMenuController.broadcastShowEvent($rootScope, "somepath", "sometype", 42, 24)
			$rootScope.$digest()
			expect(nodeContextMenuController.onShowNodeContextMenu).toHaveBeenCalledWith("somepath", "sometype", 42, 24)
		})

		it("should call 'hideContextMenu' on 'hide-node-context-menu' events", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()
			NodeContextMenuController.broadcastHideEvent($rootScope)
			$rootScope.$digest()
			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
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
			const nodeType = "Folder"

			nodeContextMenuController.onShowNodeContextMenu("/root", "Folder", 42, 24)
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

	describe("hideNode", () => {
		it("should set _viewModel.contextMenuBuilding to null and call codeMapActionService.hideNode with null", () => {
			codeMapActionsService.hideNode = jest.fn()

			nodeContextMenuController.hideNode()
			$timeout.flush()

			expect(codeMapActionsService.hideNode).toHaveBeenCalledWith(null)
		})
	})

	describe("showNode", () => {
		it("should set _viewModel.contextMenuBuilding to null and call codeMapActionService.showNode with null", () => {
			codeMapActionsService.showNode = jest.fn()

			nodeContextMenuController.showNode()
			$timeout.flush()

			expect(codeMapActionsService.showNode).toHaveBeenCalledWith(null)
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
			const markedPackages = [{ path: "/root", color: "color" }]
			settingsService.getSettings = jest.fn().mockReturnValue({ fileSettings: { markedPackages } })

			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("color")

			expect(result).toBeTruthy()
			expect(settingsService.getSettings).toHaveBeenCalled()
		})

		it("should return false, if package is not marked and doesn't match the color of parent folder", () => {
			const markedPackages = [{ path: "/root", color: "color" }]
			settingsService.getSettings = jest.fn().mockReturnValue({ fileSettings: { markedPackages } })

			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("another color")

			expect(result).toBeFalsy()
			expect(settingsService.getSettings).toHaveBeenCalled()
		})

		it("should return true, if package is marked and matches the color", () => {
			const markedPackages = [{ path: "/another root", color: "color" }]
			settingsService.getSettings = jest.fn().mockReturnValue({ fileSettings: { markedPackages } })
			codeMapActionsService.getParentMP = jest.fn().mockReturnValue({ path: "/another root", color: "color" })

			nodeContextMenuController["_viewModel"].contextMenuBuilding = VALID_NODE_WITH_PATH

			const result = nodeContextMenuController.currentFolderIsMarkedWithColor("color")

			expect(result).toBeTruthy()
			expect(codeMapActionsService.getParentMP).toHaveBeenCalledWith(
				nodeContextMenuController["_viewModel"].contextMenuBuilding.path,
				{ fileSettings: { markedPackages } }
			)
			expect(settingsService.getSettings).toHaveBeenCalled()
		})
	})

	describe("markFolder", () => {
		it("should call hide and codeMapActionService.markFolder", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()
			codeMapActionsService.markFolder = jest.fn()

			nodeContextMenuController.markFolder("color")

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
			expect(codeMapActionsService.markFolder).toHaveBeenCalledWith(
				nodeContextMenuController["_viewModel"].contextMenuBuilding,
				"color"
			)
		})
	})

	describe("unmarkFolder", () => {
		it("should call hide and codeMapActionService.unmarkFolder", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()
			codeMapActionsService.unmarkFolder = jest.fn()

			nodeContextMenuController.unmarkFolder()

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
			expect(codeMapActionsService.unmarkFolder).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].contextMenuBuilding)
		})
	})

	describe("focusNode", () => {
		it("should call hide and codeMapActionService.focusNode", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()
			codeMapActionsService.focusNode = jest.fn()

			nodeContextMenuController.focusNode()

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
			expect(codeMapActionsService.focusNode).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].contextMenuBuilding)
		})
	})

	describe("excludeNode", () => {
		it("should call hide and codeMapActionService.excludeNode", () => {
			nodeContextMenuController.onHideNodeContextMenu = jest.fn()
			codeMapActionsService.excludeNode = jest.fn()

			nodeContextMenuController.excludeNode()

			expect(nodeContextMenuController.onHideNodeContextMenu).toHaveBeenCalled()
			expect(codeMapActionsService.excludeNode).toHaveBeenCalledWith(nodeContextMenuController["_viewModel"].contextMenuBuilding)
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
