import { Box3 } from "three"
import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { TEST_NODE_ROOT } from "../../mocks/dataMocks"
import { CodeMapNode, Node } from "../../model/codeCharta.model"
import { idToNodeSelector } from "../../renderer/renderModel/renderModel.facade"
import { CodeMapTooltipService } from "../../renderer/threeViewer/codeMap.tooltip.service"
import { CursorType, changeCursorIndicator } from "../../renderer/threeViewer/cursorIndicator"
import { IdToBuildingService } from "../../renderer/threeViewer/idToBuilding.service"
import { CodeMapBuilding } from "../../renderer/threeViewer/rendering/codeMapBuilding"
import { CODE_MAP_BUILDING } from "../../renderer/threeViewer/rendering/codeMapBuilding.mocks"
import { ThreeCameraService } from "../../renderer/threeViewer/threeCamera.service"
import { ThreeRendererService } from "../../renderer/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../renderer/threeViewer/threeSceneService"
import { ThreeViewerService } from "../../renderer/threeViewer/threeViewer.service"
import { ViewCubeMouseEventsService } from "../viewCube/facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { setUpCodeMapMouseEventService } from "./codeMap.mouseEvent.service.mocks"

jest.mock("../../renderer/renderModel/accumulatedData/idToNode.selector", () => ({
    idToNodeSelector: jest.fn()
}))
const mockedIdToNodeSelector = jest.mocked(idToNodeSelector)

describe("codeMapMouseEventService", () => {
    let codeMapMouseEventService: CodeMapMouseEventService
    let threeCameraService: ThreeCameraService
    let threeRendererService: ThreeRendererService
    let threeSceneService: ThreeSceneService
    let labelSettingsFacade: LabelSettingsFacade
    let tooltipService: CodeMapTooltipService
    let viewCubeMouseEventsService: ViewCubeMouseEventsService
    let threeViewerService: ThreeViewerService
    let idToBuildingService: IdToBuildingService
    let constantHighlight: Map<number, CodeMapBuilding>
    let codeMapBuilding: CodeMapBuilding

    beforeEach(() => {
        ;({
            codeMapMouseEventService,
            threeCameraService,
            threeRendererService,
            threeSceneService,
            labelSettingsFacade,
            tooltipService,
            viewCubeMouseEventsService,
            threeViewerService,
            idToBuildingService,
            constantHighlight,
            codeMapBuilding
        } = setUpCodeMapMouseEventService())
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
            changeCursorIndicator(CursorType.Grabbing)

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
            changeCursorIndicator(CursorType.Moving)

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
            Object.defineProperty(codeMapMouseEventService, "oldMouse", { value: { x: 0, y: 0 }, writable: true, configurable: true })
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

        it("should force an unhover over empty area when the highlight was cleared but the store still hovers a building", () => {
            // Arrange — the highlight was nulled out-of-band (e.g. by a click or a scroll that never re-raycasts)
            // while the store still points at a building, and the cursor is now over empty map area
            jest.spyOn(codeMapMouseEventService["sharedViewReadWindow"], "getHoveredNodePath").mockReturnValue(codeMapBuilding.node.path)
            threeSceneService.getHighlightedBuilding = jest.fn().mockReturnValue(null)
            threeSceneService.getMapMesh = jest.fn().mockReturnValue({
                checkMouseRayMeshIntersection: jest.fn().mockReturnValue(undefined)
            })
            Object.defineProperty(codeMapMouseEventService, "oldMouse", { value: { x: 0, y: 0 }, writable: true, configurable: true })
            Object.defineProperty(codeMapMouseEventService, "mouse", { value: { x: 5, y: 5 }, writable: true })

            // Act
            codeMapMouseEventService.updateHovering()

            // Assert — an unhover is forced so the edge preview is restored instead of staying blank
            expect(threeSceneService.clearHighlight).toHaveBeenCalled()
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

    describe("hoverNode", () => {
        it("should do nothing when no 3D map has been built yet", () => {
            // Arrange
            threeSceneService.getMapMesh = jest.fn().mockReturnValue(undefined)

            // Act
            codeMapMouseEventService.hoverNode("/root/a")

            // Assert
            expect(threeSceneService.addBuildingsToHighlightingList).not.toHaveBeenCalled()
            expect(threeRendererService.render).not.toHaveBeenCalled()
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
})
