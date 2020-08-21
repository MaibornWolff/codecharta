import "./codeMap.module"
import "../../codeCharta.module"
import { IRootScopeService, IWindowService } from "angular"
import { ClickType, CodeMapMouseEventService, CursorType } from "./codeMap.mouseEvent.service"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { MapTreeViewLevelController } from "../mapTreeView/mapTreeView.level.component"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { CODE_MAP_BUILDING, TEST_FILE_WITH_PATHS, TEST_NODE_ROOT, withMockedEventMethods } from "../../util/dataMocks"
import _ from "lodash"
import { BlacklistType, CCFile, CodeMapNode, Node } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { FilesService } from "../../state/store/files/files.service"
import { StoreService } from "../../state/store.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import { setIdToBuilding } from "../../state/store/lookUp/idToBuilding/idToBuilding.actions"
import { setIdToNode } from "../../state/store/lookUp/idToNode/idToNode.actions"

describe("codeMapMouseEventService", () => {
	let codeMapMouseEventService: CodeMapMouseEventService

	let $rootScope: IRootScopeService
	let $window: IWindowService
	let threeCameraService: ThreeCameraService
	let threeRendererService: ThreeRendererService
	let threeSceneService: ThreeSceneService
	let threeUpdateCycleService: ThreeUpdateCycleService
	let storeService: StoreService

	let codeMapBuilding: CodeMapBuilding
	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedWindow()
		withMockedThreeUpdateCycleService()
		withMockedThreeRendererService()
		withMockedViewCubeMouseEventsService()
		withMockedThreeCameraService()
		withMockedThreeSceneService()
		withMockedEventMethods($rootScope)
		NodeDecorator.preDecorateFile(TEST_FILE_WITH_PATHS)
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$window = getService<IWindowService>("$window")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		threeRendererService = getService<ThreeRendererService>("threeRendererService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		threeUpdateCycleService = getService<ThreeUpdateCycleService>("threeUpdateCycleService")
		storeService = getService<StoreService>("storeService")

		codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
		file = _.cloneDeep(TEST_FILE_WITH_PATHS)
		document.body.style.cursor = CursorType.Default
	}

	function rebuildService() {
		codeMapMouseEventService = new CodeMapMouseEventService(
			$rootScope,
			$window,
			threeCameraService,
			threeRendererService,
			threeSceneService,
			threeUpdateCycleService,
			storeService
		)

		codeMapMouseEventService["oldMouse"] = { x: 1, y: 1 }
	}

	function withMockedWindow() {
		$window.open = jest.fn()
	}

	function withMockedThreeUpdateCycleService() {
		threeUpdateCycleService = codeMapMouseEventService["threeUpdateCycleService"] = jest.fn().mockReturnValue({
			register: jest.fn()
		})()
	}

	function withMockedThreeRendererService() {
		threeRendererService = codeMapMouseEventService["threeRendererService"] = jest.fn().mockReturnValue({
			renderer: {
				domElement: {
					addEventListener: jest.fn()
				}
			}
		})()
	}

	function withMockedViewCubeMouseEventsService() {
		ViewCubeMouseEventsService.subscribeToEventPropagation = jest.fn()
	}

	function withMockedThreeCameraService() {
		threeCameraService = codeMapMouseEventService["threeCameraService"] = jest.fn().mockReturnValue({
			camera: {
				updateMatrixWorld: jest.fn()
			}
		})()
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapMouseEventService["threeSceneService"] = jest.fn().mockReturnValue({
			getMapMesh: jest.fn().mockReturnValue({
				clearHighlight: jest.fn(),
				highlightSingleBuilding: jest.fn(),
				clearSelection: jest.fn(),
				selectBuilding: jest.fn(),
				getMeshDescription: jest.fn().mockReturnValue({
					buildings: [codeMapBuilding]
				})
			}),
			clearHighlight: jest.fn(),
			highlightSingleBuilding: jest.fn(),
			clearSelection: jest.fn(),
			selectBuilding: jest.fn(),
			getSelectedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING),
			getHighlightedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING),
			addBuildingToHighlightingList: jest.fn(),
			highlightBuildings: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should subscribe to hoverEvents", () => {
			MapTreeViewLevelController.subscribeToHoverEvents = jest.fn()

			rebuildService()

			expect(MapTreeViewLevelController.subscribeToHoverEvents).toHaveBeenCalled()
		})

		it("should call register on threeUpdateCycleService", () => {
			rebuildService()

			expect(threeUpdateCycleService.register).toHaveBeenCalled()
		})

		it("should subscribe to BlacklistService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildService()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, codeMapMouseEventService)
		})

		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildService()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, codeMapMouseEventService)
		})
	})

	describe("start", () => {
		it("should setup four event listeners", () => {
			codeMapMouseEventService.start()

			expect(threeRendererService.renderer.domElement.addEventListener).toHaveBeenCalledTimes(4)
		})

		it("should subscribe to event propagation", () => {
			ViewCubeMouseEventsService.subscribeToEventPropagation = jest.fn()

			codeMapMouseEventService.start()

			expect(ViewCubeMouseEventsService.subscribeToEventPropagation).toHaveBeenCalledWith($rootScope, codeMapMouseEventService)
		})
	})

	describe("onViewCubeEventPropagation", () => {
		beforeEach(() => {
			codeMapMouseEventService.onDocumentMouseMove = jest.fn()
			codeMapMouseEventService.onDocumentMouseDown = jest.fn()
			codeMapMouseEventService.onDocumentMouseUp = jest.fn()
			codeMapMouseEventService.onDocumentDoubleClick = jest.fn()
		})

		it("should call onDocumentMouseMove", () => {
			codeMapMouseEventService.onViewCubeEventPropagation("mousemove", null)

			expect(codeMapMouseEventService.onDocumentMouseMove).toHaveBeenCalledWith(null)
		})

		it("should call onDocumentMouseDown", () => {
			codeMapMouseEventService.onViewCubeEventPropagation("mousedown", null)

			expect(codeMapMouseEventService.onDocumentMouseDown).toHaveBeenCalledWith(null)
			expect(codeMapMouseEventService.onDocumentDoubleClick).not.toHaveBeenCalled()
		})

		it("should call onDocumentMouseUp", () => {
			codeMapMouseEventService.onViewCubeEventPropagation("mouseup", null)

			expect(codeMapMouseEventService.onDocumentMouseUp).toHaveBeenCalled()
		})

		it("should call onDocumentDoubleClick", () => {
			codeMapMouseEventService.onViewCubeEventPropagation("dblclick", null)

			expect(codeMapMouseEventService.onDocumentDoubleClick).toHaveBeenCalled()
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should deselect the building", () => {
			codeMapMouseEventService.onFilesSelectionChanged()

			expect(threeSceneService.clearSelection).toHaveBeenCalled()
		})
	})

	describe("onBlacklistChanged", () => {
		it("should deselect the building when the selected building is excluded", () => {
			const blacklist = [{ path: CODE_MAP_BUILDING.node.path, type: BlacklistType.exclude }]

			codeMapMouseEventService.onBlacklistChanged(blacklist)

			expect(threeSceneService.clearSelection).toHaveBeenCalled()
		})

		it("should deselect the building when the selected building is hidden", () => {
			const blacklist = [{ path: CODE_MAP_BUILDING.node.path, type: BlacklistType.flatten }]

			codeMapMouseEventService.onBlacklistChanged(blacklist)

			expect(threeSceneService.clearSelection).toHaveBeenCalled()
		})

		it("should not deselect the building when the selected building is not blacklisted", () => {
			codeMapMouseEventService.onBlacklistChanged([])

			expect(threeSceneService.clearSelection).not.toHaveBeenCalled()
		})

		it("should not deselect the building when no building is selected", () => {
			threeSceneService.getSelectedBuilding = jest.fn()

			codeMapMouseEventService.onBlacklistChanged([])

			expect(threeSceneService.clearSelection).not.toHaveBeenCalled()
		})
	})

	describe("updateHovering", () => {
		beforeEach(() => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn()
			})
			codeMapMouseEventService["transformHTMLToSceneCoordinates"] = jest.fn().mockReturnValue({ x: 0, y: 1 })

			const idToBuilding = new Map<number, CodeMapBuilding>()
			idToBuilding.set(CODE_MAP_BUILDING.node.id, CODE_MAP_BUILDING)
			const idToNode = new Map<number, CodeMapNode>()
			idToNode.set(file.map.id, file.map)
			storeService.dispatch(setIdToBuilding(idToBuilding))
			storeService.dispatch(setIdToNode(idToNode))
		})

		it("should call updateMatrixWorld", () => {
			codeMapMouseEventService.updateHovering()

			expect(threeCameraService.camera.updateMatrixWorld).toHaveBeenCalledWith(false)
		})

		it("should unhover the building, when no intersection was found, a building is hovered and nothing is hovered in the treeView", () => {
			codeMapMouseEventService["highlightedInTreeView"] = null

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.clearHighlight).toHaveBeenCalled()
		})

		it("should hover a node when no node is hovered and an intersection was found", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})
			threeSceneService.getHighlightedBuilding = jest.fn()

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalledWith(CODE_MAP_BUILDING)
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
		})

		it("should not hover a node again when the intersection building is the same as the hovered building", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.highlightSingleBuilding).not.toHaveBeenCalled()
		})
	})

	describe("changeCursorIndicator", () => {
		it("should set the mouseIcon to grabbing", () => {
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Grabbing)

			expect(document.body.style.cursor).toEqual(CursorType.Grabbing)
		})

		it("should set the mouseIcon to default", () => {
			document.body.style.cursor = CursorType.Pointer

			CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)

			expect(document.body.style.cursor).toEqual(CursorType.Default)
		})
	})

	describe("onDocumentMouseUp", () => {
		let event

		describe("on left click", () => {
			beforeEach(() => {
				event = { button: ClickType.LeftClick }
			})
			it("should change the cursor to default when the left click is triggered", () => {
				document.body.style.cursor = CursorType.Pointer

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(document.body.style.cursor).toEqual(CursorType.Default)
			})

			it("should not do anything when no building is hovered and nothing is selected", () => {
				threeSceneService.getHighlightedBuilding = jest.fn()
				threeSceneService.getSelectedBuilding = jest.fn()

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(threeSceneService.selectBuilding).not.toHaveBeenCalled()
			})

			it("should call selectBuilding when no building is selected", () => {
				threeSceneService.getSelectedBuilding = jest.fn()
				codeMapMouseEventService["intersectedBuilding"] = codeMapBuilding

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(codeMapBuilding)
			})

			it("should call selectBuilding when a new building is selected", () => {
				threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(new CodeMapBuilding(200, null, null, null))
				codeMapMouseEventService["intersectedBuilding"] = codeMapBuilding

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(codeMapBuilding)
			})

			it("should deselect building, when nothing is highlighted and something is selected", () => {
				threeSceneService.getHighlightedBuilding = jest.fn()

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(threeSceneService.clearSelection).toHaveBeenCalled()
			})
		})

		describe("on right click", () => {
			beforeEach(() => {
				event = { button: ClickType.RightClick, clientX: 0, clientY: 1 }
			})

			it("should $broadcast a building-right-clicked event with data", () => {
				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect($rootScope.$broadcast).toHaveBeenCalledWith("building-right-clicked", {
					building: codeMapBuilding,
					x: event.clientX,
					y: event.clientY
				})
			})

			it("should not $broadcast a building-right-clicked event when no intersection was found", () => {
				threeSceneService.getHighlightedBuilding = jest.fn()

				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect($rootScope.$broadcast).not.toHaveBeenCalled()
			})

			it("should not $broadcast a building-right-clicked event when the mouse has moved since last click", () => {
				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)
				codeMapMouseEventService.onDocumentMouseMove({ clientX: 10, clientY: 20 })

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect($rootScope.$broadcast).not.toHaveBeenCalled()
			})
		})
	})

	describe("onDocumentMouseDown", () => {
		it("should the cursor to moving when pressing the right button", () => {
			const event = { button: ClickType.RightClick }

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(document.body.style.cursor).toEqual(CursorType.Moving)
		})

		it("should change the cursor to grabbing when pressing the left button just once", () => {
			const event = { button: ClickType.LeftClick }

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(document.body.style.cursor).toEqual(CursorType.Grabbing)
		})

		it("should save the mouse position", () => {
			const event = { clientX: 10, clientY: 20 }

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(codeMapMouseEventService["mouseOnLastClick"]).toEqual({ x: event.clientX, y: event.clientY })
		})
	})

	describe("onDocumentDoubleClick", () => {
		it("should return if hovered is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn()

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should not do anything if hovered.node.link is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn()

			codeMapBuilding.setNode({ link: null } as Node)

			codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should call open with link if hovered.node.link is defined", () => {
			codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).toHaveBeenCalledWith("NO_LINK", "_blank")
		})
	})

	describe("unhoverBuilding", () => {
		it("should clear the highlight when to is null", () => {
			codeMapMouseEventService["unhoverBuilding"]()

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-unhovered")
			expect(threeSceneService.clearHighlight).toHaveBeenCalled()
		})
	})

	describe("hoverBuilding", () => {
		beforeEach(() => {
			const idToBuilding = new Map<number, CodeMapBuilding>()
			idToBuilding.set(codeMapBuilding.node.id, codeMapBuilding)
			const idToNode = new Map<number, CodeMapNode>()
			idToNode.set(file.map.id, file.map)
			storeService.dispatch(setIdToBuilding(idToBuilding))
			storeService.dispatch(setIdToNode(idToNode))
		})

		it("should set the highlight when to is not null", () => {
			codeMapMouseEventService["hoverBuilding"](codeMapBuilding)

			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalledWith(codeMapBuilding)
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
		})

		it("should add property node", () => {
			codeMapBuilding.setNode(undefined)
			codeMapBuilding.parent = codeMapBuilding
			codeMapBuilding.parent.setNode(TEST_NODE_ROOT)

			codeMapMouseEventService["hoverBuilding"](codeMapBuilding)

			expect(codeMapBuilding.node).toEqual(codeMapBuilding.parent.node)
		})
	})

	describe("onShouldHoverNode", () => {
		beforeEach(() => {
			codeMapMouseEventService["hoverBuilding"] = jest.fn()
		})

		it("should call threeSceneService.getMapDescription", () => {
			codeMapMouseEventService.onShouldHoverNode(file.map)

			expect(threeSceneService.getMapMesh().getMeshDescription).toHaveBeenCalled()
		})

		it("should call onBuildingHovered", () => {
			codeMapBuilding.node.path = file.map.path
			threeSceneService.getHighlightedBuilding = jest.fn()

			codeMapMouseEventService.onShouldHoverNode(file.map)

			expect(codeMapMouseEventService["hoverBuilding"]).toHaveBeenCalledWith(codeMapBuilding)
		})
	})

	describe("onShouldUnhoverNode", () => {
		it("should call onBuildingHovered", () => {
			codeMapMouseEventService["unhoverBuilding"] = jest.fn()
			codeMapMouseEventService["highlightedInTreeView"] = codeMapBuilding

			codeMapMouseEventService.onShouldUnhoverNode()

			expect(codeMapMouseEventService["unhoverBuilding"]).toHaveBeenCalled()
		})
	})
})
