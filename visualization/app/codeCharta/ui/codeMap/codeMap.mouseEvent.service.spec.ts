import "./codeMap.module"
import "../../codeCharta.module"
import { IRootScopeService, IWindowService } from "angular"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { MapTreeViewLevelController } from "../mapTreeView/mapTreeView.level.component"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { CODE_MAP_BUILDING, TEST_FILE_WITH_PATHS, TEST_NODE_ROOT } from "../../util/dataMocks"
import _ from "lodash"
import { Node } from "../../codeCharta.model"

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
		withMockedMapTreeViewLevelController()
		withMockedThreeRendererService()
		withMockedViewCubeMouseEventsService()
		withMockedThreeCameraService()
		withMockedThreeSceneService()
		withMockedEventMethods()
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
		codeMapMouseEventService["oldMouse"] = { x: 1, y: 1 }
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
		$rootScope.$on = jest.fn()
	}

	function withMockedWindow() {
		$window.open = jest.fn()
	}

	function withMockedThreeUpdateCycleService() {
		threeUpdateCycleService = codeMapMouseEventService["threeUpdateCycleService"] = jest.fn().mockReturnValue({
			register: jest.fn()
		})()
	}

	function withMockedMapTreeViewLevelController() {
		MapTreeViewLevelController.subscribeToHoverEvents = jest.fn()
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
				highlightBuilding: jest.fn(),
				clearSelection: jest.fn(),
				selectBuilding: jest.fn(),
				getMeshDescription: jest.fn().mockReturnValue({
					buildings: [codeMapBuilding]
				})
			}),
			clearHighlight: jest.fn(),
			highlightBuilding: jest.fn(),
			clearSelection: jest.fn(),
			selectBuilding: jest.fn(),
			getSelectedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING),
			getHighlightedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
		})()
	}

	describe("constructor", () => {
		it("should subscribe to hoverEvents", () => {
			rebuildService()

			expect(MapTreeViewLevelController.subscribeToHoverEvents).toHaveBeenCalled()
		})

		it("should call register on threeUpdateCycleService", () => {
			rebuildService()

			expect(threeUpdateCycleService.register).toHaveBeenCalled()
		})
	})

	describe("start", () => {
		it("should setup four event listeners", () => {
			codeMapMouseEventService.start()

			expect(threeRendererService.renderer.domElement.addEventListener).toHaveBeenCalledTimes(4)
		})

		it("should subscribe to event propagation", () => {
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

			expect(codeMapMouseEventService.onDocumentDoubleClick).toHaveBeenCalledWith(null)
		})
	})

	describe("update", () => {
		beforeEach(() => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue({
					intersectionFound: false,
					building: CODE_MAP_BUILDING
				})
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
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue({
					intersectionFound: true,
					building: CODE_MAP_BUILDING
				})
			})
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.highlightBuilding).toHaveBeenCalledWith(CODE_MAP_BUILDING)
		})

		it("should not hover a node again when the intersection building is the same as the hovered building", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue({
					intersectionFound: true,
					building: CODE_MAP_BUILDING
				})
			})

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.highlightBuilding).not.toHaveBeenCalled()
		})
	})

	describe("onDocumentMouseUp", () => {
		beforeEach(() => {
			codeMapMouseEventService.onBuildingSelected = jest.fn()
		})

		it("should not do anything when no building is hovered and nothing is selected", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)
			threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onDocumentMouseUp()

			expect(codeMapMouseEventService.onBuildingSelected).not.toHaveBeenCalled()
		})

		it("should call onBuildingSelected when no building is selected", () => {
			threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onDocumentMouseUp()

			expect(codeMapMouseEventService.onBuildingSelected).toHaveBeenCalledWith(null, codeMapBuilding)
		})

		it("should call onBuildingSelected when a new building is selected", () => {
			threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(new CodeMapBuilding(200, null, null, null))

			codeMapMouseEventService.onDocumentMouseUp()

			expect(codeMapMouseEventService.onBuildingSelected).toHaveBeenCalledWith(null, codeMapBuilding)
		})

		it("should deselect building, when nothing is highlighted and something is selected", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onDocumentMouseUp()

			expect(codeMapMouseEventService.onBuildingSelected).toHaveBeenCalledWith(null, null)
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

			expect(codeMapMouseEventService.onLeftClick).toHaveBeenCalledWith(event)
		})

		it("should call onRightClick with 2 if event.button is 2", () => {
			const event = { button: 2 }

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(codeMapMouseEventService.onRightClick).toHaveBeenCalledWith(event)
		})
	})

	describe("onRightClick", () => {
		it("should $broadcast a building-right-clicked event with data", () => {
			const event = { clientX: 0, clientY: 1 }
			codeMapMouseEventService["dragOrClickFlag"] = 1

			codeMapMouseEventService.onRightClick(event)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-right-clicked", {
				building: codeMapBuilding,
				x: 0,
				y: 1,
				event
			})
		})
	})

	describe("onLeftClick", () => {
		it("should set dragOrClickFlag to 0", () => {
			codeMapMouseEventService.onLeftClick(undefined)

			expect(codeMapMouseEventService["dragOrClickFlag"]).toBe(0)
		})
	})

	describe("onDocumentDoubleClick", () => {
		it("should return if hovered is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onDocumentDoubleClick(undefined)

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should not do anything if hovered.node.link is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapBuilding.setNode({ link: null } as Node)

			codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick(undefined)

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should call open with link if hovered.node.link is defined", () => {
			codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick(undefined)

			expect($window.open).toHaveBeenCalledWith("NO_LINK", "_blank")
		})
	})

	describe("onBuildingHovered", () => {
		it("should clear the highlight when to is null", () => {
			codeMapMouseEventService.onBuildingHovered(null, null)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-hovered", { to: null, from: null })
			expect(threeSceneService.clearHighlight).toHaveBeenCalled()
		})

		it("should set the highlight when to is not null", () => {
			codeMapMouseEventService.onBuildingHovered(null, codeMapBuilding)

			expect(threeSceneService.highlightBuilding).toHaveBeenCalledWith(codeMapBuilding)
		})

		it("should add property node", () => {
			codeMapBuilding.setNode(undefined)
			codeMapBuilding.parent = codeMapBuilding
			codeMapBuilding.parent.setNode(TEST_NODE_ROOT)

			codeMapMouseEventService.onBuildingHovered(null, codeMapBuilding)

			expect(codeMapBuilding.node).toEqual(codeMapBuilding.parent.node)
		})

		it("should not add property node if to has no parent", () => {
			codeMapBuilding.setNode(undefined)
			codeMapBuilding.parent = undefined

			codeMapMouseEventService.onBuildingHovered(null, codeMapBuilding)

			expect(codeMapBuilding.node).not.toEqual(TEST_NODE_ROOT)
		})
	})

	describe("onBuildingSelected", () => {
		it("should select a building", () => {
			codeMapMouseEventService.onBuildingSelected(codeMapBuilding, codeMapBuilding)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-selected", {
				to: codeMapBuilding,
				from: codeMapBuilding
			})
			expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(codeMapBuilding)
		})

		it("should clear selection", () => {
			codeMapMouseEventService.onBuildingSelected(codeMapBuilding, null)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-selected", {
				to: null,
				from: codeMapBuilding
			})
			expect(threeSceneService.clearSelection).toHaveBeenCalled()
		})

		it("should clear the currently selected building and then select the new one", () => {
			codeMapMouseEventService.onBuildingSelected(null, codeMapBuilding)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-selected", {
				to: codeMapBuilding,
				from: null
			})
			expect(threeSceneService.clearSelection).toHaveBeenCalled()
			expect(threeSceneService.selectBuilding).toHaveBeenCalledWith(codeMapBuilding)
		})
	})

	describe("onShouldHoverNode", () => {
		beforeEach(() => {
			codeMapMouseEventService.onBuildingHovered = jest.fn()
		})

		it("should call threeSceneService.getMapDescription", () => {
			codeMapMouseEventService.onShouldHoverNode(TEST_FILE_WITH_PATHS.map)

			expect(threeSceneService.getMapMesh().getMeshDescription).toHaveBeenCalled()
		})

		it("should call onBuildingHovered", () => {
			codeMapBuilding.node.path = TEST_FILE_WITH_PATHS.map.path
			threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)

			codeMapMouseEventService.onShouldHoverNode(TEST_FILE_WITH_PATHS.map)

			expect(codeMapMouseEventService.onBuildingHovered).toHaveBeenCalledWith(null, codeMapBuilding)
		})
	})

	describe("onShouldUnhoverNode", () => {
		it("should call onBuildingHovered", () => {
			codeMapMouseEventService.onBuildingHovered = jest.fn()
			codeMapMouseEventService["highlightedInTreeView"] = codeMapBuilding

			codeMapMouseEventService.onShouldUnhoverNode(null)

			expect(codeMapMouseEventService.onBuildingHovered).toHaveBeenCalledWith(codeMapBuilding, null)
		})
	})
})
