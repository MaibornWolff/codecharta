import "./codeMap.module"
import "../../codeCharta.module"
import { TestBed } from "@angular/core/testing"
import { IRootScopeService, IWindowService } from "angular"
import { ClickType, CodeMapMouseEventService, CursorType } from "./codeMap.mouseEvent.service"
import { ThreeCameraService } from "./threeViewer/threeCamera.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { ThreeRendererService } from "./threeViewer/threeRenderer.service"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { CODE_MAP_BUILDING, CONSTANT_HIGHLIGHT, TEST_FILE_WITH_PATHS, TEST_NODES, withMockedEventMethods } from "../../util/dataMocks"
import { BlacklistType, CodeMapNode, Node } from "../../codeCharta.model"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { FilesService } from "../../state/store/files/files.service"
import { StoreService } from "../../state/store.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import { klona } from "klona"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { BufferGeometry, Material, Object3D, Raycaster, Vector3 } from "three"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { mocked } from "ts-jest/utils"
import { idToNodeSelector } from "../../state/selectors/accumulatedData/idToNode.selector"
import { IdToBuildingService } from "../../services/idToBuilding/idToBuilding.service"
import { Store } from "../../state/angular-redux/store"
import { State } from "../../state/angular-redux/state"

jest.mock("../../state/selectors/accumulatedData/idToNode.selector", () => ({
	idToNodeSelector: jest.fn()
}))
const mockedIdToNodeSelector = mocked(idToNodeSelector)

describe("codeMapMouseEventService", () => {
	let codeMapMouseEventService: CodeMapMouseEventService

	let $rootScope: IRootScopeService
	let $window: IWindowService
	let threeCameraService: ThreeCameraService
	let threeRendererService: ThreeRendererService
	let threeSceneService: ThreeSceneService
	let storeService: StoreService
	let codeMapLabelService: CodeMapLabelService
	let viewCubeMouseEventsService: ViewCubeMouseEventsService
	let threeViewerService: ThreeViewerService
	let idToBuildingService: IdToBuildingService

	let codeMapBuilding: CodeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedWindow()
		withMockedThreeRendererService()
		withMockedThreeCameraService()
		withMockedThreeSceneService()
		withMockedEventMethods($rootScope)
		NodeDecorator.decorateMap(
			TEST_FILE_WITH_PATHS.map,
			{
				nodeMetricData: [],
				edgeMetricData: []
			},
			[]
		)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")
		threeCameraService = TestBed.inject(ThreeCameraService)
		threeRendererService = TestBed.inject(ThreeRendererService)
		threeSceneService = TestBed.inject(ThreeSceneService)
		threeSceneService.getMapMesh = jest.fn().mockReturnValue({
			clearHighlight: jest.fn(),
			highlightSingleBuilding: jest.fn(),
			clearSelection: jest.fn(),
			selectBuilding: jest.fn(),
			getMeshDescription: jest.fn().mockReturnValue({
				buildings: [codeMapBuilding]
			}),
			checkMouseRayMeshIntersection: jest.fn()
		})
		threeSceneService.getSelectedBuilding = jest.fn().mockReturnValue(CODE_MAP_BUILDING)
		threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(CODE_MAP_BUILDING)
		threeSceneService.getConstantHighlight = jest.fn().mockReturnValue(new Map())

		$rootScope = getService<IRootScopeService>("$rootScope")
		$window = getService<IWindowService>("$window")
		storeService = getService<StoreService>("storeService")
		threeViewerService = TestBed.inject(ThreeViewerService)
		viewCubeMouseEventsService = {
			subscribe: jest.fn(),
			propagateMovement: jest.fn(),
			resetIsDragging: jest.fn(),
			onDocumentDoubleClick: jest.fn()
		} as unknown as ViewCubeMouseEventsService
		idToBuildingService = getService<IdToBuildingService>("idToBuilding")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapLabelService["threeSceneService"] = threeSceneService

		codeMapBuilding = klona(CODE_MAP_BUILDING)
		document.body.style.cursor = CursorType.Default
	}

	function rebuildService() {
		codeMapMouseEventService = new CodeMapMouseEventService(
			$rootScope,
			$window,
			threeCameraService,
			threeRendererService,
			threeSceneService,
			storeService,
			codeMapLabelService,
			viewCubeMouseEventsService,
			threeViewerService,
			idToBuildingService
		)

		codeMapMouseEventService["oldMouse"] = { x: 1, y: 1 }
	}

	function withMockedWindow() {
		$window.open = jest.fn()
	}

	function withMockedThreeRendererService() {
		threeRendererService = codeMapMouseEventService["threeRendererService"] = jest.fn().mockReturnValue({
			renderer: {
				domElement: {
					addEventListener: jest.fn(),
					getBoundingClientRect: jest.fn().mockReturnValue({
						top: 0
					}),
					width: 1,
					height: 1
				},
				getPixelRatio: jest.fn().mockReturnValue(2)
			},
			render: jest.fn()
		})()
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
				}),
				checkMouseRayMeshIntersection: jest.fn()
			}),
			clearHighlight: jest.fn(),
			highlightSingleBuilding: jest.fn(),
			clearSelection: jest.fn(),
			clearConstantHighlight: jest.fn(),
			clearHoverHighlight: jest.fn(),
			selectBuilding: jest.fn(),
			getSelectedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING),
			getHighlightedBuilding: jest.fn().mockReturnValue(CODE_MAP_BUILDING),
			getConstantHighlight: jest.fn().mockReturnValue(new Map()),
			addBuildingToHighlightingList: jest.fn(),
			highlightBuildings: jest.fn(),
			resetLabel: jest.fn()
		})()
	}

	describe("constructor", () => {
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
		it("should register all event listeners", () => {
			codeMapMouseEventService.start()

			const addEventListenerMock = threeRendererService.renderer.domElement.addEventListener as jest.Mock

			expect(addEventListenerMock.mock.calls[0][0]).toEqual("mousemove")
			expect(addEventListenerMock.mock.calls[1][0]).toEqual("mouseup")
			expect(addEventListenerMock.mock.calls[2][0]).toEqual("mousedown")
			expect(addEventListenerMock.mock.calls[3][0]).toEqual("dblclick")
			expect(addEventListenerMock.mock.calls[4][0]).toEqual("mouseleave")
			expect(addEventListenerMock.mock.calls[5][0]).toEqual("mouseenter")
			expect(addEventListenerMock.mock.calls[6][0]).toEqual("wheel")
			expect(addEventListenerMock).toHaveBeenCalledTimes(7)
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
			const data = { type: "mousemove", event: new MouseEvent("mousemove") }
			codeMapMouseEventService.onViewCubeEventPropagation(data)
			expect(codeMapMouseEventService.onDocumentMouseMove).toHaveBeenCalledWith(data.event)
		})

		it("should call onDocumentMouseDown", () => {
			const data = { type: "mousedown", event: new MouseEvent("mousedown") }
			codeMapMouseEventService.onViewCubeEventPropagation(data)
			expect(codeMapMouseEventService.onDocumentMouseDown).toHaveBeenCalledWith(data.event)
			expect(codeMapMouseEventService.onDocumentDoubleClick).not.toHaveBeenCalled()
		})

		it("should call onDocumentMouseUp", () => {
			const data = { type: "mouseup", event: new MouseEvent("mouseup") }
			codeMapMouseEventService.onViewCubeEventPropagation(data)
			expect(codeMapMouseEventService.onDocumentMouseUp).toHaveBeenCalledWith(data.event)
		})

		it("should call onDocumentDoubleClick", () => {
			const data = { type: "dblclick", event: new MouseEvent("dblclick") }
			codeMapMouseEventService.onViewCubeEventPropagation(data)
			expect(codeMapMouseEventService.onDocumentDoubleClick).toHaveBeenCalledWith()
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

	describe("updateHoveringIntegrationTest", () => {
		it("should not animate any labels and reset animated label and temporary label if the map is turned", () => {
			const label = new Object3D()
			setAnimatedLabel(label)
			const animatedLabelPosition = label.position.clone()

			// Grabbing and turning the map (should reset the animated label)
			codeMapMouseEventService.onDocumentMouseDown({ button: ClickType.LeftClick } as MouseEvent)
			expect(codeMapMouseEventService["isGrabbing"]).toBe(true)
			expect(codeMapMouseEventService["isMoving"]).toBe(false)
			codeMapMouseEventService.onDocumentMouseMove({ clientX: 2, clientY: 3 } as MouseEvent)

			codeMapMouseEventService["temporaryLabelForBuilding"] = label.clone()
			codeMapMouseEventService.updateHovering()

			expect(threeSceneService["highlightedLabel"]).toBeNull()
			expect(codeMapMouseEventService["temporaryLabelForBuilding"]).toBeNull()
			expect(label["material"].opacity).toEqual(0.7)
			expect(label.position).not.toEqual(animatedLabelPosition)
		})

		it("should not animate any labels and reset animated label and temporary label if the map is moved", () => {
			const label = new Object3D()
			setAnimatedLabel(label)
			const animatedLabelPosition = label.position.clone()

			// Grabbing and moving the map (should reset the animated label)
			codeMapMouseEventService.onDocumentMouseDown({ button: ClickType.RightClick } as MouseEvent)
			expect(codeMapMouseEventService["isGrabbing"]).toBe(false)
			expect(codeMapMouseEventService["isMoving"]).toBe(true)
			codeMapMouseEventService.onDocumentMouseMove({ clientX: 3, clientY: 4 } as MouseEvent)

			codeMapMouseEventService["temporaryLabelForBuilding"] = label.clone()
			codeMapMouseEventService.updateHovering()

			expect(threeSceneService["highlightedLabel"]).toBeNull()
			expect(codeMapMouseEventService["temporaryLabelForBuilding"]).toBeNull()
			expect(label["material"].opacity).toEqual(0.7)
			expect(label.position).not.toEqual(animatedLabelPosition)
		})

		function setAnimatedLabel(label: Object3D) {
			// At first, animate a label
			threeSceneService = new ThreeSceneService(
				TestBed.inject(Store),
				TestBed.inject(State),
				idToBuildingService,
				threeRendererService
			)
			threeSceneService["mapMesh"] = new CodeMapMesh(TEST_NODES, storeService.getState(), false)
			threeSceneService["highlighted"] = [CODE_MAP_BUILDING]
			threeSceneService["constantHighlight"] = CONSTANT_HIGHLIGHT

			const resultPosition = new Vector3(0.5, 0.5, 0)

			const labels = []
			const placeholderLine = new Object3D()
			const labelNode = new Object3D()
			label["material"] = new Material()
			const rayCaster = new Raycaster(new Vector3(10, 10, 0), new Vector3(1, 1, 1))

			labelNode.translateX(-4)
			labelNode.translateY(5)

			const points = [new Vector3(2, 2, 2), new Vector3(1, 1, 1)]

			const lineGeometry = new BufferGeometry().setFromPoints(points)
			placeholderLine["geometry"] = lineGeometry

			labels.push(label, placeholderLine, labelNode, placeholderLine)

			threeSceneService.animateLabel(label, rayCaster, labels)

			// Ensure that label is animated correctly
			expect(label["material"].opacity).toEqual(1)
			expect(label.position).toEqual(resultPosition)
			expect(threeSceneService["highlightedLabel"]).toEqual(label)

			// Rebuild service with modified threeSceneService
			rebuildService()
		}
	})

	describe("updateHovering", () => {
		beforeEach(() => {
			mockedIdToNodeSelector.mockImplementation(() => {
				const idToNode = new Map<number, CodeMapNode>()
				idToNode.set(codeMapBuilding.node.id, codeMapBuilding.node as unknown as CodeMapNode)
				return idToNode
			})
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn()
			})
			codeMapMouseEventService["transformHTMLToSceneCoordinates"] = jest.fn().mockReturnValue({ x: 0, y: 1 })

			idToBuildingService.setIdToBuilding([CODE_MAP_BUILDING])

			threeSceneService.resetLabel = jest.fn()
			threeSceneService.getLabelForHoveredNode = jest.fn()
			threeSceneService.animateLabel = jest.fn()
			threeSceneService.getHighlightedBuilding = jest.fn()
		})

		it("should call updateMatrixWorld", () => {
			codeMapMouseEventService["modifiedLabel"] = null

			codeMapMouseEventService.updateHovering()

			expect(threeCameraService.camera.updateMatrixWorld).toHaveBeenCalledWith(false)
		})

		it("should un-highlight the building, when no intersection was found and a building is hovered", () => {
			codeMapMouseEventService["modifiedLabel"] = null
			codeMapMouseEventService["highlightedInTreeView"] = null

			codeMapMouseEventService.updateHovering()
			expect(threeSceneService.clearHighlight).toHaveBeenCalled()
		})

		it("should not call resetLabel if no change has happened ", () => {
			codeMapMouseEventService["modifiedLabel"] = null
			codeMapMouseEventService["highlightedInTreeView"] = null

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.getLabelForHoveredNode).not.toHaveBeenCalled()
		})

		it("should call resetLabel when a new building is hovered", () => {
			codeMapMouseEventService["modifiedLabel"] = null
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})
			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.resetLabel).toHaveBeenCalled()
		})

		it("should call clearTemporaryLabel and remove temporary label when a new building is hovered", () => {
			codeMapMouseEventService["temporaryLabelForBuilding"] = CODE_MAP_BUILDING.node

			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})
			codeMapLabelService.clearTemporaryLabel = jest.fn()
			codeMapMouseEventService.updateHovering()

			expect(codeMapLabelService.clearTemporaryLabel).toHaveBeenCalled()
			expect(codeMapLabelService["temporaryLabelForBuilding"]).not.toEqual(CODE_MAP_BUILDING.node)
		})

		it("should hover a node when an intersection was found and the cursor is set to pointing and call getLabelForHoveredNode", () => {
			codeMapMouseEventService["modifiedLabel"] = null
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})
			threeSceneService.animateLabel = jest.fn()

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalled()
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
			expect(threeSceneService.getLabelForHoveredNode).toHaveBeenCalled()
			expect(threeSceneService.animateLabel).toHaveBeenCalled()
			expect(document.body.style.cursor).toEqual(CursorType.Pointer)
		})

		it("should not highlight node when an intersection was found and the cursor is set to grabbing", () => {
			codeMapMouseEventService["modifiedLabel"] = null
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})
			codeMapMouseEventService["isGrabbing"] = true
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Grabbing)

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.addBuildingToHighlightingList).not.toHaveBeenCalled()
			expect(threeSceneService.highlightBuildings).not.toHaveBeenCalled()
			expect(document.body.style.cursor).toEqual(CursorType.Grabbing)
		})

		it("should not highlight a node when an intersection was found and the cursor is set to moving", () => {
			codeMapMouseEventService["modifiedLabel"] = null
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})
			codeMapMouseEventService["isMoving"] = true
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Moving)

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.addBuildingToHighlightingList).not.toHaveBeenCalled()
			expect(threeSceneService.highlightBuildings).not.toHaveBeenCalled()
			expect(document.body.style.cursor).toEqual(CursorType.Moving)
		})

		it("should not highlight a node again when the intersection building is the same", () => {
			codeMapMouseEventService["modifiedLabel"] = null
			threeSceneService.getMapMesh = jest.fn().mockReturnValue({
				checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
			})

			codeMapMouseEventService.updateHovering()

			expect(threeSceneService.highlightSingleBuilding).not.toHaveBeenCalled()
		})
	})

	describe("onDocumentMouseUp", () => {
		let event

		it("should call resetIsDragging", () => {
			event = { button: ClickType.LeftClick }
			viewCubeMouseEventsService["resetIsDragging"] = jest.fn()

			codeMapMouseEventService.onDocumentMouseUp(event)

			expect(viewCubeMouseEventsService.resetIsDragging).toHaveBeenCalled()
		})

		describe("on left click", () => {
			beforeEach(() => {
				event = { button: ClickType.LeftClick, clientX: 10, clientY: 20 }
			})
			it("should change the cursor to default when the left click is triggered", () => {
				document.body.style.cursor = CursorType.Pointer

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(document.body.style.cursor).toEqual(CursorType.Default)
			})

			it("should not do anything when no building is highlight and nothing is selected", () => {
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

			it("should call clearselection, when the mouse has moved less or exact 3 pixels while left button was pressed", () => {
				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)
				codeMapMouseEventService.onDocumentMouseMove({ clientX: 10, clientY: 17 } as MouseEvent)

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(threeSceneService.clearSelection).toHaveBeenCalled()
			})

			it("should not call clear selection, when mouse has moved more than 3 pixels while left button was pressed", () => {
				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)
				codeMapMouseEventService.onDocumentMouseMove({ clientX: 6, clientY: 20 } as MouseEvent)

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect(threeSceneService.clearSelection).not.toHaveBeenCalled()
			})
		})

		describe("on right click", () => {
			beforeEach(() => {
				event = { button: ClickType.RightClick, clientX: 0, clientY: 1 }
			})

			it("should $broadcast a building-right-clicked event", () => {
				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect($rootScope.$broadcast).toHaveBeenCalled()
			})

			it("should not $broadcast a building-right-clicked event when no intersection was found", () => {
				threeSceneService.getHighlightedBuilding = jest.fn()

				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect($rootScope.$broadcast).not.toHaveBeenCalledWith("building-right-clicked")
			})

			it("should not $broadcast a building-right-clicked event when the mouse has moved more than 3 Pixels since last click", () => {
				codeMapMouseEventService.onDocumentMouseMove(event)
				codeMapMouseEventService.onDocumentMouseDown(event)
				codeMapMouseEventService.onDocumentMouseMove({ clientX: 10, clientY: 20 } as MouseEvent)

				codeMapMouseEventService.onDocumentMouseUp(event)

				expect($rootScope.$broadcast).not.toHaveBeenCalledWith("building-right-clicked")
			})
		})
	})

	describe("onDocumentMouseDown", () => {
		it("should change the cursor to moving when pressing the right button", () => {
			const event = { button: ClickType.RightClick } as MouseEvent

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(document.body.style.cursor).toEqual(CursorType.Moving)
		})

		it("should change the cursor to grabbing when pressing the left button just once", () => {
			const event = { button: ClickType.LeftClick } as MouseEvent

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(document.body.style.cursor).toEqual(CursorType.Grabbing)
		})

		it("should save the mouse position", () => {
			const event = { clientX: 10, clientY: 20 } as MouseEvent

			codeMapMouseEventService.onDocumentMouseDown(event)

			expect(codeMapMouseEventService["mouseOnLastClick"]).toEqual({ x: event.clientX, y: event.clientY })
		})
	})

	describe("onDocumentDoubleClick", () => {
		it("should return if highlighted and selected is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn()
			threeSceneService.getSelectedBuilding = jest.fn()

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should not call window.open if hovered.node.link and selected.node.link is null", () => {
			threeSceneService.getHighlightedBuilding = jest.fn()
			threeSceneService.getSelectedBuilding = jest.fn()

			codeMapBuilding.setNode({ link: null } as Node)

			codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding
			codeMapMouseEventService["selectedInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).not.toHaveBeenCalled()
		})

		it("should call open with link if hovered.node.link is defined", () => {
			codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).toHaveBeenCalledWith("NO_LINK", "_blank")
		})

		it("should call open with link if selected.node.link is defined", () => {
			codeMapMouseEventService["selectedInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).toHaveBeenCalledWith("NO_LINK", "_blank")
		})

		it("should call open with link if selected.node.link is defined", () => {
			codeMapMouseEventService["selectedInCodeMap"] = codeMapBuilding

			codeMapMouseEventService.onDocumentDoubleClick()

			expect($window.open).toHaveBeenCalledWith("NO_LINK", "_blank")
		})
	})

	describe("onDocumentMouseEnter", () => {
		it("should enable orbitals rotation", () => {
			threeViewerService["enableRotation"] = jest.fn()
			viewCubeMouseEventsService["enableRotation"] = jest.fn()

			codeMapMouseEventService.onDocumentMouseEnter()

			expect(threeViewerService.enableRotation).toHaveBeenCalledWith(true)
			expect(viewCubeMouseEventsService.enableRotation).toHaveBeenCalledWith(true)
		})
	})

	describe("onDocumentMouseLeave", () => {
		it("should disable orbitals rotation", () => {
			const event = { relatedTarget: {} } as MouseEvent

			threeViewerService["enableRotation"] = jest.fn()
			viewCubeMouseEventsService["enableRotation"] = jest.fn()

			codeMapMouseEventService.onDocumentMouseLeave(event)

			expect(threeViewerService.enableRotation).toHaveBeenCalledWith(false)
			expect(viewCubeMouseEventsService.enableRotation).toHaveBeenCalledWith(false)
		})
	})

	describe("onDocumentMouseMove", () => {
		it("should call propagateMovement", () => {
			const event = { clientX: 10, clientY: 10 } as MouseEvent

			viewCubeMouseEventsService["propagateMovement"] = jest.fn()

			codeMapMouseEventService.onDocumentMouseMove(event)

			expect(viewCubeMouseEventsService.propagateMovement).toHaveBeenCalled()
		})

		it("should call updateHovering when moving the mouse", () => {
			const event = { clientX: 10, clientY: 10 } as MouseEvent
			codeMapMouseEventService.updateHovering = jest.fn()
			codeMapMouseEventService.onDocumentMouseMove(event)
			expect(codeMapMouseEventService.updateHovering).toHaveBeenCalled()
		})
	})

	describe("unhoverBuilding", () => {
		it("should clear the highlight when to is null and constantHighlight is empty", () => {
			codeMapMouseEventService["unhoverBuilding"]()

			expect(threeSceneService.clearHighlight).toHaveBeenCalled()
		})

		it("should only clear the hovered highlight when to is null but constantHighlight is not empty", () => {
			threeSceneService.getConstantHighlight = jest.fn().mockReturnValue(CONSTANT_HIGHLIGHT)
			codeMapMouseEventService["unhoverBuilding"]()

			expect(threeSceneService.clearHoverHighlight).toHaveBeenCalled()
		})
	})

	describe("hoverBuilding", () => {
		beforeEach(() => {
			mockedIdToNodeSelector.mockImplementation(() => {
				const idToNode = new Map<number, CodeMapNode>()
				idToNode.set(codeMapBuilding.node.id, codeMapBuilding.node as unknown as CodeMapNode)
				return idToNode
			})
			idToBuildingService.setIdToBuilding([codeMapBuilding])
		})

		it("should set the highlight when to is not null", () => {
			codeMapMouseEventService["hoverBuilding"](codeMapBuilding)

			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalledWith(codeMapBuilding)
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
		})
	})

	describe("transformHTMLToSceneCoordinates", () => {
		beforeEach(() => {
			rebuildService()
			codeMapMouseEventService.onDocumentMouseMove = jest.fn()
		})

		it("should call getPixelRatio", () => {
			codeMapMouseEventService.onDocumentMouseMove({ clientX: 6, clientY: 20 } as MouseEvent)
			codeMapMouseEventService["transformHTMLToSceneCoordinates"]()

			expect(threeRendererService.renderer.getPixelRatio).toHaveBeenCalled()
		})

		it("should call getBoundingClientRect", () => {
			codeMapMouseEventService.onDocumentMouseMove({ clientX: 6, clientY: 20 } as MouseEvent)
			codeMapMouseEventService["transformHTMLToSceneCoordinates"]()

			expect(threeRendererService.renderer.domElement.getBoundingClientRect).toHaveBeenCalled()
		})

		it("should return the screen cordiantes", () => {
			codeMapMouseEventService.onDocumentMouseMove({ clientX: 6, clientY: 20 } as MouseEvent)
			const result = codeMapMouseEventService["transformHTMLToSceneCoordinates"]()

			expect(result).toStrictEqual({ x: -1, y: 1 })
		})
	})

	describe("drawTemporaryLabelFor", () => {
		it("should call addLeafLabel on codeMapLabelService with given node and the corresponding height that is different from 0", () => {
			threeSceneService.getLabelForHoveredNode = jest.fn()
			codeMapLabelService.addLeafLabel = jest.fn()

			codeMapMouseEventService["drawTemporaryLabelFor"](codeMapBuilding, null)
			const nodeHeight = codeMapBuilding.node.height + Math.abs(codeMapBuilding.node.heightDelta ?? 0)

			expect(threeSceneService.getLabelForHoveredNode).toHaveBeenCalled()
			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledWith(codeMapBuilding.node, 0, true)
			expect(nodeHeight).toBeGreaterThan(0)
		})

		it("should call addLeafLabel on codeMapLabelService with temporary label name even when both label options are set to false", () => {
			threeSceneService.getLabelForHoveredNode = jest.fn()
			codeMapLabelService.addLeafLabel = jest.fn()
			storeService.dispatch(setShowMetricLabelNameValue(false))
			storeService.dispatch(setShowMetricLabelNodeName(false))

			codeMapMouseEventService["drawTemporaryLabelFor"](codeMapBuilding, null)

			expect(threeSceneService.getLabelForHoveredNode).toHaveBeenCalled()
			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledWith(codeMapBuilding.node, 0, true)
		})

		it("should not generate names in temporary Label when metric option is set to true and name is set to false", () => {
			threeSceneService.getLabelForHoveredNode = jest.fn()
			codeMapLabelService.addLeafLabel = jest.fn()
			storeService.dispatch(setShowMetricLabelNameValue(true))
			storeService.dispatch(setShowMetricLabelNodeName(false))

			codeMapMouseEventService["drawTemporaryLabelFor"](codeMapBuilding, null)

			expect(threeSceneService.getLabelForHoveredNode).toHaveBeenCalled()
			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledWith(codeMapBuilding.node, 0, true)
		})
	})
})
