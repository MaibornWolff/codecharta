import "./codeMap.module"
import "../../codeCharta.module"
import { IRootScopeService, IWindowService } from "angular"
import { CodeMapMouseEventService, ClickType } from "./codeMap.mouseEvent.service"
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
import { BlacklistType, Node } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { FilesService } from "../../state/store/files/files.service"

describe("codeMapMouseEventService", () => {
	let codeMapMouseEventService: CodeMapMouseEventService

	let $rootScope: IRootScopeService
	let $window: IWindowService
	let threeCameraService: ThreeCameraService
	let threeRendererService: ThreeRendererService
	let threeSceneService: ThreeSceneService
	let threeUpdateCycleService: ThreeUpdateCycleService

	let codeMapBuilding: CodeMapBuilding

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

		codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
	}

	function rebuildService() {
		codeMapMouseEventService = new CodeMapMouseEventService(
			$rootScope,
			$window,
			threeCameraService,
			threeRendererService,
			threeSceneService,
			threeUpdateCycleService
		)

		codeMapMouseEventService["mouse"] = { x: 0, y: 0 }
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
			getHighlightedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
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
			codeMapMouseEventService.onFilesSelectionChanged(undefined)

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
			threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onBlacklistChanged([])

			expect(threeSceneService.clearSelection).not.toHaveBeenCalled()
		})
	})

	describe("updateHovering", () => {
		beforeEach(() => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(null)
			})
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
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.highlightSingleBuilding).toHaveBeenCalledWith(CODE_MAP_BUILDING)
		})

		it("should not hover a node again when the intersection building is the same as the hovered building", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.highlightSingleBuilding).not.toHaveBeenCalled()
		})
	})

	describe("onDocumentMouseUp", () => {
		beforeEach(() => {
			codeMapMouseEventService["clickType"] = ClickType.LeftClick
		})

		it("should not do anything when no building is hovered and nothing is selected", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)
			threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onDocumentMouseUp()

			expect(threeSceneService.selectBuilding).not.toHaveBeenCalled()
		})

		it("should call selectBuilding when no building is selected", () => {
			threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(null)
			codeMapMouseEventService["intersectedBuilding"] = codeMapBuilding

			codeMapMouseEventService.onDocumentMouseUp()

			expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(codeMapBuilding)
		})

		it("should call selectBuilding when a new building is selected", () => {
			threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(new CodeMapBuilding(200, null, null, null))
			codeMapMouseEventService["intersectedBuilding"] = codeMapBuilding

			codeMapMouseEventService.onDocumentMouseUp()

			expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(codeMapBuilding)
		})

		it("should deselect building, when nothing is highlighted and something is selected", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onDocumentMouseUp()

			expect(threeSceneService.clearSelection).toHaveBeenCalled()
		})
	})

	describe("onDocumentMouseDown", () => {
		beforeEach(() => {
			codeMapMouseEventService.onLeftClick = jest.fn()
			codeMapMouseEventService.onRightClick = jest.fn()
		})

		it("should call onLeftClick with 0 if event.button is 0", () => {
			const event = { button: 0 }

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(codeMapMouseEventService.onLeftClick).toHaveBeenCalled()
		})

		it("should call onRightClick with 2 if event.button is 2", () => {
			const event = { button: 2 }

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(codeMapMouseEventService.onRightClick).toHaveBeenCalledWith(event)
		})
	})

	describe("onRightClick", () => {
		beforeEach(() => {
			codeMapMouseEventService["intersectionResult"] = { intersectionFound: true }
		})

		it("should $broadcast a building-right-clicked event with data", () => {
			const event = { clientX: 0, clientY: 1 }
			codeMapMouseEventService["clickType"] = ClickType.RightClick

			codeMapMouseEventService.onRightClick(event)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-right-clicked", {
				building: codeMapBuilding,
				x: 0,
				y: 1,
				event
			})
		})

		it("should not $broadcast a building-right-clicked event when no building is highlighted", () => {
			threeSceneService.getHighlightedBuilding = jest.fn()

			const event = { clientX: 0, clientY: 1 }
			codeMapMouseEventService["clickType"] = ClickType.RightClick

			codeMapMouseEventService.onRightClick(event)

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onLeftClick", () => {
		it("should set clickType to LeftClick", () => {
			codeMapMouseEventService.onLeftClick()

			expect(codeMapMouseEventService["clickType"]).toBe(ClickType.LeftClick)
		})
	})

	describe("onDocumentDoubleClick", () => {
		it("should return if hovered is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should not do anything if hovered.node.link is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

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
		it("should set the highlight when to is not null", () => {
			codeMapMouseEventService["hoverBuilding"](codeMapBuilding)

			expect(threeSceneService.highlightSingleBuilding).toHaveBeenCalledWith(codeMapBuilding)
		})

		it("should add property node", () => {
			codeMapBuilding.setNode(undefined)
			codeMapBuilding.parent = codeMapBuilding
			codeMapBuilding.parent.setNode(TEST_NODE_ROOT)

			codeMapMouseEventService["hoverBuilding"](codeMapBuilding)

			expect(codeMapBuilding.node).toEqual(codeMapBuilding.parent.node)
		})

		it("should not add property node if to has no parent", () => {
			codeMapBuilding.setNode(undefined)
			codeMapBuilding.parent = undefined

			codeMapMouseEventService["hoverBuilding"](codeMapBuilding)

			expect(codeMapBuilding.node).not.toEqual(TEST_NODE_ROOT)
		})
	})

	describe("onShouldHoverNode", () => {
		beforeEach(() => {
			codeMapMouseEventService["hoverBuilding"] = jest.fn()
		})

		it("should call threeSceneService.getMapDescription", () => {
			codeMapMouseEventService.onShouldHoverNode(TEST_FILE_WITH_PATHS.map)

			expect(threeSceneService.getMapMesh().getMeshDescription).toHaveBeenCalled()
		})

		it("should call onBuildingHovered", () => {
			codeMapBuilding.node.path = TEST_FILE_WITH_PATHS.map.path
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onShouldHoverNode(TEST_FILE_WITH_PATHS.map)

			expect(codeMapMouseEventService["hoverBuilding"]).toHaveBeenCalledWith(codeMapBuilding)
		})
	})

	describe("onShouldUnhoverNode", () => {
		it("should call onBuildingHovered", () => {
			codeMapMouseEventService["unhoverBuilding"] = jest.fn()
			codeMapMouseEventService["highlightedInTreeView"] = codeMapBuilding

			codeMapMouseEventService.onShouldUnhoverNode(null)

			expect(codeMapMouseEventService["unhoverBuilding"]).toHaveBeenCalled()
		})
	})
})
