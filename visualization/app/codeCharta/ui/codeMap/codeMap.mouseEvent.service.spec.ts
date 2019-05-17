import "./codeMap.module"
import "../../codeCharta.module"
import { IRootScopeService, IWindowService } from "angular"
import { CodeMapMouseEventService, CodeMapMouseEventServiceSubscriber } from "./codeMap.mouseEvent.service"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { CodeMapRenderService } from "./codeMap.render.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { MapTreeViewLevelController } from "../mapTreeView/mapTreeView.level.component"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { TEST_FILE_WITH_PATHS, TEST_NODE_ROOT } from "../../util/dataMocks"
import * as THREE from "three"

describe("codeMapMouseEventService", () => {
	let codeMapMouseEventService: CodeMapMouseEventService

	let $rootScope: IRootScopeService
	let $window: IWindowService
	let threeCameraService: ThreeCameraService
	let threeRendererService: ThreeRendererService
	let threeSceneService: ThreeSceneService
	let threeUpdateCycleService: ThreeUpdateCycleService
	let codeMapRenderService: CodeMapRenderService

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
		withMockedCodeMapRenderService()
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
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")

		codeMapBuilding = new CodeMapBuilding(1, new THREE.Box3(), TEST_NODE_ROOT)
	}

	function rebuildService() {
		codeMapMouseEventService = new CodeMapMouseEventService(
			$rootScope,
			$window,
			threeCameraService,
			threeRendererService,
			threeSceneService,
			threeUpdateCycleService,
			codeMapRenderService
		)
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
			getMapMesh: jest.fn()
		})()
	}

	function withMockedCodeMapRenderService() {
		codeMapRenderService = codeMapMouseEventService["codeMapRenderService"] = jest.fn().mockReturnValue({
			mapMesh: {
				getMeshDescription: jest.fn().mockReturnValue({
					buildings: [codeMapBuilding]
				})
			}
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
			codeMapMouseEventService.onBuildingHovered = jest.fn()
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue({
					intersectionFound: false,
					building: 1
				})
			})

			codeMapMouseEventService["hovered"] = 2
		})

		it("should call updateMatrixWorld", () => {
			codeMapMouseEventService.update()

			expect(threeCameraService.camera.updateMatrixWorld).toHaveBeenCalledWith(false)
		})

		it("should call onBuildingHovered with 2 and null", () => {
			codeMapMouseEventService.update()

			expect(codeMapMouseEventService.onBuildingHovered).toHaveBeenCalledWith(2, null)
		})

		it("should not call onBuildingHovered", () => {
			codeMapMouseEventService["hovered"] = null

			codeMapMouseEventService.update()

			expect(codeMapMouseEventService.onBuildingHovered).not.toHaveBeenCalled()
		})

		it("should call onBuildingHovered with 2 and 1", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue({
					intersectionFound: true,
					building: 1
				})
			})

			codeMapMouseEventService.update()

			expect(codeMapMouseEventService.onBuildingHovered).toHaveBeenCalledWith(2, 1)
		})

		it("should set hovered to null", () => {
			codeMapMouseEventService.update()

			expect(codeMapMouseEventService["hovered"]).toBeNull()
		})
	})

	describe("onDocumentMouseUp", () => {
		beforeEach(() => {
			codeMapMouseEventService.onBuildingSelected = jest.fn()
		})

		it("should call onBuildingSelected", () => {
			codeMapMouseEventService["hovered"] = 1

			codeMapMouseEventService.onDocumentMouseUp()

			expect(codeMapMouseEventService.onBuildingSelected).toHaveBeenCalledWith(null, 1)
		})

		it("should call onBuildingSelected", () => {
			codeMapMouseEventService["selected"] = 1

			codeMapMouseEventService.onDocumentMouseUp()

			expect(codeMapMouseEventService.onBuildingSelected).toHaveBeenCalledWith(1, null)
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
			withMockedEventMethods()

			const event = { clientX: 0, clientY: 1 }

			codeMapMouseEventService.onRightClick(event)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-right-clicked", {
				building: null,
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
			codeMapMouseEventService.onDocumentDoubleClick(undefined)

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should not do anything if hovered.node.link is null", () => {
			codeMapMouseEventService["hovered"] = { node: { link: null } }

			codeMapMouseEventService.onDocumentDoubleClick(undefined)

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should call open with link if hovered.node.link is defined", () => {
			codeMapMouseEventService["hovered"] = { node: { link: 1 } }

			codeMapMouseEventService.onDocumentDoubleClick(undefined)

			expect($window.open).toHaveBeenCalledWith(1, "_blank")
		})
	})

	describe("onBuildingHovered", () => {
		it("should broadcast a building-hovered event and clear mesh highlight", () => {
			withMockedEventMethods()
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({ clearHighlight: jest.fn() })

			codeMapMouseEventService.onBuildingHovered(null, null)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-hovered", { to: null, from: null })
			expect(threeSceneService.getMapMesh).toHaveBeenCalled()
		})

		it("should broadcast a building-hovered event and set mesh highlight", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({ setHighlighted: jest.fn() })

			codeMapMouseEventService.onBuildingHovered(null, codeMapBuilding)

			expect(threeSceneService.getMapMesh).toHaveBeenCalled()
			expect(threeSceneService.getMapMesh().setHighlighted).toHaveBeenCalledWith([codeMapBuilding])
		})

		it("should add property node", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({ setHighlighted: jest.fn() })

			codeMapBuilding.node = undefined
			codeMapBuilding.parent = codeMapBuilding
			codeMapBuilding.parent.node = TEST_NODE_ROOT

			codeMapMouseEventService.onBuildingHovered(null, codeMapBuilding)

			expect(codeMapBuilding.node).toEqual(codeMapBuilding.parent.node)
		})

		it("should not add property node if to has no parent", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({ setHighlighted: jest.fn() })

			codeMapBuilding.node = undefined
			codeMapBuilding.parent = undefined

			codeMapMouseEventService.onBuildingHovered(null, codeMapBuilding)

			expect(codeMapBuilding.node).not.toEqual(TEST_NODE_ROOT)
		})
	})

	describe("onBuildingSelected", () => {
		it("should broadcast a building-selected event", () => {
			withMockedEventMethods()
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({ setSelected: jest.fn() })

			codeMapMouseEventService.onBuildingSelected(codeMapBuilding, codeMapBuilding)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("building-selected", { to: codeMapBuilding, from: codeMapBuilding })
		})

		it("should clear selection on mesh", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({ clearSelected: jest.fn() })

			codeMapMouseEventService.onBuildingSelected(codeMapBuilding, null)

			expect(threeSceneService.getMapMesh).toHaveBeenCalled()
			expect(threeSceneService.getMapMesh().clearSelected).toHaveBeenCalled()
		})

		it("should clear selection on mesh", () => {
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({ setSelected: jest.fn() })

			codeMapMouseEventService.onBuildingSelected(codeMapBuilding, codeMapBuilding)

			expect(threeSceneService.getMapMesh).toHaveBeenCalled()
			expect(threeSceneService.getMapMesh().setSelected).toHaveBeenCalledWith([codeMapBuilding])
		})
	})

	describe("onShouldHoverNode", () => {
		beforeEach(() => {
			codeMapMouseEventService.onBuildingHovered = jest.fn()
		})

		it("should call codeMapRenderService.getMapDescription", () => {
			codeMapMouseEventService.onShouldHoverNode(TEST_FILE_WITH_PATHS.map)

			expect(codeMapRenderService.mapMesh.getMeshDescription).toHaveBeenCalled()
		})

		it("should call onBuildingHovered", () => {
			codeMapBuilding.node.path = TEST_FILE_WITH_PATHS.map.path

			codeMapMouseEventService.onShouldHoverNode(TEST_FILE_WITH_PATHS.map)

			expect(codeMapMouseEventService.onBuildingHovered).toHaveBeenCalledWith(null, codeMapBuilding)
		})
	})

	describe("onShouldUnhoverNode", () => {
		it("should call onBuildingHovered", () => {
			codeMapMouseEventService.onBuildingHovered = jest.fn()

			codeMapMouseEventService["hovered"] = 1

			codeMapMouseEventService.onShouldUnhoverNode(null)

			expect(codeMapMouseEventService.onBuildingHovered).toHaveBeenCalledWith(1, null)
		})
	})

	describe("subscribe", () => {
		let subscriberMock: CodeMapMouseEventServiceSubscriber

		beforeEach(() => {
			subscriberMock = new MapTreeViewLevelController($rootScope, null, null)
			subscriberMock.onBuildingHovered = jest.fn()
			subscriberMock.onBuildingSelected = jest.fn()
			subscriberMock.onBuildingRightClicked = jest.fn()
		})

		it("should setup three angular event listeners", () => {
			withMockedEventMethods()

			CodeMapMouseEventService.subscribe($rootScope, null)

			expect($rootScope.$on).toHaveBeenCalledTimes(3)
		})

		it("should call onBuildingHovered of subscriber", () => {
			CodeMapMouseEventService.subscribe($rootScope, subscriberMock)
			$rootScope.$broadcast("building-hovered")

			expect(subscriberMock.onBuildingHovered).toHaveBeenCalled()
		})

		it("should call onBuildingSelected of subscriber", () => {
			CodeMapMouseEventService.subscribe($rootScope, subscriberMock)
			$rootScope.$broadcast("building-selected")

			expect(subscriberMock.onBuildingSelected).toHaveBeenCalled()
		})

		it("should call onBuildingRightClicked of subscriber", () => {
			CodeMapMouseEventService.subscribe($rootScope, subscriberMock)
			$rootScope.$broadcast("building-right-clicked", { building: 1 })

			expect(subscriberMock.onBuildingRightClicked).toHaveBeenCalled()
		})
	})
})
