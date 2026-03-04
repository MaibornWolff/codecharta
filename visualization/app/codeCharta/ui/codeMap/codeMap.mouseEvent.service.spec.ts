import { TestBed } from "@angular/core/testing"
import { ClickType, CodeMapMouseEventService, CursorType } from "./codeMap.mouseEvent.service"
import { ThreeCameraService } from "./threeViewer/threeCamera.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeRendererService } from "./threeViewer/threeRenderer.service"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { BlacklistItem, CcState, CodeMapNode, Node } from "../../codeCharta.model"
import { NodeDecorator } from "../../util/nodeDecorator"
import { klona } from "klona"
import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { CodeMapTooltipService } from "./codeMap.tooltip.service"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { idToNodeSelector } from "../../state/selectors/accumulatedData/idToNode.selector"
import { IdToBuildingService } from "../../services/idToBuilding/idToBuilding.service"
import { setRightClickedNodeData } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { State, Store } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { defaultState } from "../../state/store/state.manager"
import { Box3 } from "three"
import {
    CODE_MAP_BUILDING,
    CODE_MAP_BUILDING_TS_NODE,
    CONSTANT_HIGHLIGHT,
    TEST_FILE_WITH_PATHS,
    TEST_NODE_ROOT
} from "../../util/dataMocks"

jest.mock("../../state/selectors/accumulatedData/idToNode.selector", () => ({
    idToNodeSelector: jest.fn()
}))
const mockedIdToNodeSelector = jest.mocked(idToNodeSelector)

describe("codeMapMouseEventService", () => {
    let codeMapMouseEventService: CodeMapMouseEventService
    let threeCameraService: ThreeCameraService
    let threeRendererService: ThreeRendererService
    let threeSceneService: ThreeSceneService
    let store: Store<CcState>
    let state: State<CcState>
    let labelSettingsFacade: LabelSettingsFacade
    let tooltipService: CodeMapTooltipService
    let viewCubeMouseEventsService: ViewCubeMouseEventsService
    let threeViewerService: ThreeViewerService
    let idToBuildingService: IdToBuildingService
    let constantHighlight: Map<number, CodeMapBuilding>

    let codeMapBuilding: CodeMapBuilding

    beforeEach(() => {
        restartSystem()
        rebuildService()
        withMockedWindow()
        withMockedThreeRendererService()
        withMockedThreeCameraService()
        withMockedThreeSceneService()
        NodeDecorator.decorateMap(
            TEST_FILE_WITH_PATHS.map,
            {
                nodeMetricData: [],
                edgeMetricData: []
            },
            []
        )
        constantHighlight = new Map(CONSTANT_HIGHLIGHT)
    })

    function restartSystem() {
        TestBed.configureTestingModule({
            providers: [provideMockStore(), { provide: State, useValue: { getValue: () => defaultState } }]
        })
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

        store = TestBed.inject(MockStore)
        state = TestBed.inject(State)
        threeViewerService = TestBed.inject(ThreeViewerService)
        viewCubeMouseEventsService = {
            subscribe: jest.fn(),
            propagateMovement: jest.fn(),
            resetIsDragging: jest.fn(),
            onDocumentDoubleClick: jest.fn()
        } as unknown as ViewCubeMouseEventsService
        idToBuildingService = TestBed.inject(IdToBuildingService)
        labelSettingsFacade = TestBed.inject(LabelSettingsFacade)
        labelSettingsFacade["threeSceneService"] = threeSceneService
        tooltipService = {
            show: jest.fn(),
            hide: jest.fn(),
            updatePosition: jest.fn(),
            isVisible: jest.fn().mockReturnValue(false),
            getCurrentNodeId: jest.fn().mockReturnValue(null),
            getRect: jest.fn().mockReturnValue(null),
            dispose: jest.fn()
        } as unknown as CodeMapTooltipService

        codeMapBuilding = klona(CODE_MAP_BUILDING)
        document.body.style.cursor = CursorType.Default
    }

    function rebuildService() {
        codeMapMouseEventService = new CodeMapMouseEventService(
            threeCameraService,
            threeRendererService,
            threeSceneService,
            store,
            state,
            labelSettingsFacade,
            tooltipService,
            viewCubeMouseEventsService,
            threeViewerService,
            idToBuildingService
        )

        codeMapMouseEventService["oldMouse"] = { x: 1, y: 1 }
    }

    function withMockedWindow() {
        window.open = jest.fn()
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
            addBuildingsToHighlightingList: jest.fn(),
            applyHighlights: jest.fn()
        })()
    }

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
            const blacklist: BlacklistItem[] = [{ path: CODE_MAP_BUILDING.node.path, type: "exclude" }]

            codeMapMouseEventService.onBlacklistChanged(blacklist)

            expect(threeSceneService.clearSelection).toHaveBeenCalled()
        })

        it("should deselect the building when the selected building is hidden", () => {
            const blacklist: BlacklistItem[] = [{ path: CODE_MAP_BUILDING.node.path, type: "flatten" }]

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
            codeMapMouseEventService["threeSceneService"].getHighlightedBuilding = () => ({ id: 1 }) as CodeMapBuilding

            codeMapMouseEventService.updateHovering()
            expect(threeSceneService.clearHighlight).toHaveBeenCalled()
        })

        it("should show tooltip when a new building is hovered", () => {
            threeSceneService.getMapMesh = jest.fn().mockReturnValue({
                checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
            })
            codeMapMouseEventService.updateHovering()

            expect(tooltipService.show).toHaveBeenCalledWith(CODE_MAP_BUILDING.node, expect.any(Number), expect.any(Number))
        })

        it("should hover a node when an intersection was found and the cursor is set to pointing", () => {
            codeMapMouseEventService["modifiedLabel"] = null
            threeSceneService.getMapMesh = jest.fn().mockReturnValue({
                checkMouseRayMeshIntersection: jest.fn().mockReturnValue(CODE_MAP_BUILDING)
            })

            codeMapMouseEventService.updateHovering()

            expect(threeSceneService.addBuildingsToHighlightingList).toHaveBeenCalled()
            expect(threeSceneService.applyHighlights).toHaveBeenCalled()
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

            expect(threeSceneService.addBuildingsToHighlightingList).not.toHaveBeenCalled()
            expect(threeSceneService.applyHighlights).not.toHaveBeenCalled()
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

            expect(threeSceneService.addBuildingsToHighlightingList).not.toHaveBeenCalled()
            expect(threeSceneService.applyHighlights).not.toHaveBeenCalled()
            expect(document.body.style.cursor).toEqual(CursorType.Moving)
        })

        it("should use differential path when transitioning between two buildings", () => {
            codeMapMouseEventService["modifiedLabel"] = null
            const nodeA: Node = { ...TEST_NODE_ROOT, id: 100 }
            const nodeB: Node = { ...TEST_NODE_ROOT, id: 200 }
            const buildingA = new CodeMapBuilding(100, new Box3(), nodeA, "#69AE40")
            const buildingB = new CodeMapBuilding(200, new Box3(), nodeB, "#69AE40")

            mockedIdToNodeSelector.mockImplementation(() => {
                const idToNode = new Map<number, CodeMapNode>()
                idToNode.set(buildingA.node.id, buildingA.node as unknown as CodeMapNode)
                idToNode.set(buildingB.node.id, buildingB.node as unknown as CodeMapNode)
                return idToNode
            })
            idToBuildingService.setIdToBuilding([buildingA, buildingB])

            // First hover on buildingA
            threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)
            threeSceneService.getMapMesh = jest.fn().mockReturnValue({
                checkMouseRayMeshIntersection: jest.fn().mockReturnValue(buildingA)
            })
            codeMapMouseEventService.updateHovering()

            // Now hover on buildingB (transition) - reset mocks to track only the second call
            threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(buildingA)
            threeSceneService.getMapMesh = jest.fn().mockReturnValue({
                checkMouseRayMeshIntersection: jest.fn().mockReturnValue(buildingB)
            })
            threeSceneService.prepareHighlightTransition = jest.fn()
            ;(threeSceneService.clearHighlight as jest.Mock).mockClear()
            ;(threeSceneService.clearHoverHighlight as jest.Mock).mockClear()
            codeMapMouseEventService["oldMouse"] = { x: 0, y: 0 }
            Object.defineProperty(codeMapMouseEventService, "mouse", { value: { x: 5, y: 5 }, writable: true })

            codeMapMouseEventService.updateHovering()

            expect(threeSceneService.prepareHighlightTransition).toHaveBeenCalled()
            expect(threeSceneService.clearHighlight).not.toHaveBeenCalled()
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

        it("should clear label layout suppression on mouse up", () => {
            labelSettingsFacade.setSuppressLayout = jest.fn()
            event = { button: ClickType.LeftClick }

            codeMapMouseEventService.onDocumentMouseUp(event)

            expect(labelSettingsFacade.setSuppressLayout).toHaveBeenCalledWith(false)
        })

        describe("on left click", () => {
            beforeEach(() => {
                event = { button: ClickType.LeftClick, clientX: 10, clientY: 20 }
                codeMapMouseEventService["intersectedBuilding"] = undefined
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

            it("should call clearSelection, when the mouse has moved less or exact 3 pixels while left button was pressed", () => {
                codeMapMouseEventService.onDocumentMouseMove(event)
                codeMapMouseEventService.onDocumentMouseDown(event)
                codeMapMouseEventService.onDocumentMouseMove({ clientX: 10, clientY: 17 } as MouseEvent)

                codeMapMouseEventService.onDocumentMouseUp(event)

                expect(threeSceneService.clearSelection).toHaveBeenCalled()
            })

            it("should not call clearSelection, when the mouse has moved less or exact 3 pixels but a building is currently being clicked upon", () => {
                codeMapMouseEventService.onDocumentMouseMove(event)
                codeMapMouseEventService.onDocumentMouseDown(event)
                codeMapMouseEventService.onDocumentMouseMove({ clientX: 10, clientY: 17 } as MouseEvent)
                codeMapMouseEventService["intersectedBuilding"] = CODE_MAP_BUILDING

                codeMapMouseEventService.onDocumentMouseUp(event)

                expect(threeSceneService.clearSelection).toHaveBeenCalledTimes(0)
                expect(threeSceneService.selectBuilding).toHaveBeenLastCalledWith(CODE_MAP_BUILDING)
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
            let dispatchSpy: jest.SpyInstance

            beforeEach(() => {
                event = { button: ClickType.RightClick, clientX: 0, clientY: 1 }
                dispatchSpy = jest.spyOn(store, "dispatch")
            })

            afterEach(() => {
                dispatchSpy.mockRestore()
            })

            it("should broadcast a building-right-clicked event", () => {
                codeMapMouseEventService.onDocumentMouseMove(event)
                codeMapMouseEventService["intersectedBuilding"] = { node: { id: 1 } } as CodeMapBuilding
                codeMapMouseEventService.onDocumentMouseDown(event)

                codeMapMouseEventService.onDocumentMouseUp(event)

                expect(dispatchSpy).toHaveBeenCalledWith(
                    setRightClickedNodeData({
                        value: {
                            nodeId: 1,
                            xPositionOfRightClickEvent: 0,
                            yPositionOfRightClickEvent: 1
                        }
                    })
                )
            })

            it("should not broadcast a building-right-clicked event when no intersection was found", () => {
                threeSceneService.getHighlightedBuilding = jest.fn()

                codeMapMouseEventService.onDocumentMouseMove(event)
                codeMapMouseEventService.onDocumentMouseDown(event)

                codeMapMouseEventService.onDocumentMouseUp(event)

                expect(dispatchSpy).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: "SET_RIGHT_CLICKED_NODE_DATA"
                    })
                )
            })

            it("should not broadcast a building-right-clicked event when the mouse has moved more than 3 Pixels since last click", () => {
                codeMapMouseEventService.onDocumentMouseMove(event)
                codeMapMouseEventService.onDocumentMouseDown(event)
                codeMapMouseEventService.onDocumentMouseMove({ clientX: 10, clientY: 20 } as MouseEvent)

                codeMapMouseEventService.onDocumentMouseUp(event)

                expect(dispatchSpy).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: "SET_RIGHT_CLICKED_NODE_DATA"
                    })
                )
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

        it("should suppress label layout on mouse down", () => {
            labelSettingsFacade.setSuppressLayout = jest.fn()
            const event = { button: ClickType.LeftClick } as MouseEvent

            codeMapMouseEventService.onDocumentMouseDown(event)

            expect(labelSettingsFacade.setSuppressLayout).toHaveBeenCalledWith(true)
        })
    })

    describe("onDocumentDoubleClick", () => {
        it("should return if highlighted and selected is null", () => {
            threeSceneService.getHighlightedBuilding = jest.fn()
            threeSceneService.getSelectedBuilding = jest.fn()

            codeMapMouseEventService.onDocumentDoubleClick()

            expect(window.open).not.toHaveBeenCalled()
        })

        it("should not call window.open if hovered.node.link and selected.node.link is null", () => {
            threeSceneService.getHighlightedBuilding = jest.fn()
            threeSceneService.getSelectedBuilding = jest.fn()

            codeMapBuilding.setNode({ link: null } as Node)

            codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding
            codeMapMouseEventService["selectedInCodeMap"] = codeMapBuilding

            codeMapMouseEventService.onDocumentDoubleClick()

            expect(window.open).not.toHaveBeenCalled()
        })

        it("should call open with link if hovered.node.link is defined", () => {
            codeMapMouseEventService["hoveredInCodeMap"] = codeMapBuilding

            codeMapMouseEventService.onDocumentDoubleClick()

            expect(window.open).toHaveBeenCalledWith("NO_LINK", "_blank")
        })

        it("should call open with link if selected.node.link is defined", () => {
            codeMapMouseEventService["selectedInCodeMap"] = codeMapBuilding

            codeMapMouseEventService.onDocumentDoubleClick()

            expect(window.open).toHaveBeenCalledWith("NO_LINK", "_blank")
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

        it("should clear label layout suppression on mouse leave", () => {
            labelSettingsFacade.setSuppressLayout = jest.fn()
            threeViewerService["enableRotation"] = jest.fn()
            viewCubeMouseEventsService["enableRotation"] = jest.fn()
            const event = { relatedTarget: {} } as MouseEvent

            codeMapMouseEventService.onDocumentMouseLeave(event)

            expect(labelSettingsFacade.setSuppressLayout).toHaveBeenCalledWith(false)
        })

        it("should hide tooltip on mouse leave", () => {
            threeViewerService["enableRotation"] = jest.fn()
            viewCubeMouseEventsService["enableRotation"] = jest.fn()
            const event = { relatedTarget: {} } as MouseEvent

            codeMapMouseEventService.onDocumentMouseLeave(event)

            expect(tooltipService.hide).toHaveBeenCalled()
        })

        it("should restore suppressed label on mouse leave", () => {
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()
            threeViewerService["enableRotation"] = jest.fn()
            viewCubeMouseEventsService["enableRotation"] = jest.fn()
            const event = { relatedTarget: {} } as MouseEvent

            codeMapMouseEventService.onDocumentMouseLeave(event)

            expect(labelSettingsFacade.restoreSuppressedLabel).toHaveBeenCalled()
        })

        it("should unhover building on mouse leave", () => {
            codeMapMouseEventService["unhoverBuilding"] = jest.fn()
            threeViewerService["enableRotation"] = jest.fn()
            viewCubeMouseEventsService["enableRotation"] = jest.fn()
            const event = { relatedTarget: {} } as MouseEvent

            codeMapMouseEventService.onDocumentMouseLeave(event)

            expect(codeMapMouseEventService["unhoverBuilding"]).toHaveBeenCalled()
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
            codeMapMouseEventService["threeSceneService"].getConstantHighlight = jest.fn().mockReturnValue(constantHighlight)
            codeMapMouseEventService["unhoverBuilding"]()

            expect(codeMapMouseEventService["threeSceneService"].clearHoverHighlight).toHaveBeenCalled()
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

            expect(threeSceneService.addBuildingsToHighlightingList).toHaveBeenCalledWith(codeMapBuilding)
            expect(threeSceneService.applyHighlights).toHaveBeenCalled()
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

    describe("showTooltipForBuilding", () => {
        it("should show tooltip for the building", () => {
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(false)

            codeMapMouseEventService["showTooltipForBuilding"](codeMapBuilding)

            expect(tooltipService.show).toHaveBeenCalledWith(codeMapBuilding.node, expect.any(Number), expect.any(Number))
        })

        it("should suppress persistent label when tooltip activates on same node", () => {
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(true)
            labelSettingsFacade.suppressLabelForNode = jest.fn()

            codeMapMouseEventService["showTooltipForBuilding"](codeMapBuilding)

            expect(labelSettingsFacade.suppressLabelForNode).toHaveBeenCalledWith(codeMapBuilding.node)
            expect(tooltipService.show).toHaveBeenCalled()
        })
    })

    describe("labelForSelectedBuilding", () => {
        it("should create a label when selecting a building", () => {
            labelSettingsFacade.addLeafLabel = jest.fn()
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(false)
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()

            codeMapMouseEventService.drawLabelSelectedBuilding(codeMapBuilding)

            expect(tooltipService.hide).toHaveBeenCalled()
            expect(labelSettingsFacade.addLeafLabel).toHaveBeenCalledWith(codeMapBuilding.node, 0, true)
            expect(codeMapMouseEventService["labelSelectedBuilding"]).toEqual(codeMapBuilding.node)
        })

        it("should remove the label when a previously selected building is unselected", () => {
            labelSettingsFacade.clearTemporaryLabel = jest.fn()
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(false)
            labelSettingsFacade.addLeafLabel = jest.fn()
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()
            codeMapMouseEventService.drawLabelSelectedBuilding(codeMapBuilding)

            codeMapMouseEventService["clearLabelSelectedBuilding"]()

            expect(labelSettingsFacade.clearTemporaryLabel).toHaveBeenCalledWith(codeMapBuilding.node)
            expect(codeMapMouseEventService["labelSelectedBuilding"]).toBeNull()
        })

        it("should remove the old and create the new label when selected building is changed", () => {
            const oldSelection = codeMapBuilding
            const newSelection = CODE_MAP_BUILDING_TS_NODE

            labelSettingsFacade.clearTemporaryLabel = jest.fn()
            labelSettingsFacade.addLeafLabel = jest.fn()
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(false)
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()

            codeMapMouseEventService.drawLabelSelectedBuilding(codeMapBuilding)

            codeMapMouseEventService["intersectedBuilding"] = newSelection
            codeMapMouseEventService["onLeftClick"]()

            expect(codeMapMouseEventService["labelSelectedBuilding"]).not.toEqual(oldSelection.node)
            expect(codeMapMouseEventService["labelSelectedBuilding"]).toEqual(newSelection.node)
            expect(labelSettingsFacade.clearTemporaryLabel).toHaveBeenCalledWith(codeMapBuilding.node)
            expect(labelSettingsFacade.addLeafLabel).toHaveBeenCalledWith(oldSelection.node, 0, true)
            expect(labelSettingsFacade.addLeafLabel).toHaveBeenCalledWith(newSelection.node, 0, true)
            expect(labelSettingsFacade.addLeafLabel).toHaveBeenCalledTimes(2)
        })
    })
})
