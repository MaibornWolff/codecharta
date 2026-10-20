import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { CodeMapTooltipService } from "../../renderer/threeViewer/codeMap.tooltip.service"
import { CursorType, changeCursorIndicator } from "../../renderer/threeViewer/cursorIndicator"
import { CODE_MAP_BUILDING } from "../../renderer/threeViewer/rendering/codeMapBuilding.mocks"
import { ThreeRendererService } from "../../renderer/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../renderer/threeViewer/threeSceneService"
import { ThreeViewerService } from "../../renderer/threeViewer/threeViewer.service"
import { ViewCubeMouseEventsService } from "../viewCube/facade"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { setUpCodeMapMouseEventService } from "./codeMap.mouseEvent.service.mocks"

jest.mock("../../renderer/renderModel/accumulatedData/idToNode.selector", () => ({
    idToNodeSelector: jest.fn()
}))

describe("codeMapMouseEventService", () => {
    let codeMapMouseEventService: CodeMapMouseEventService
    let threeRendererService: ThreeRendererService
    let threeSceneService: ThreeSceneService
    let labelSettingsFacade: LabelSettingsFacade
    let tooltipService: CodeMapTooltipService
    let viewCubeMouseEventsService: ViewCubeMouseEventsService
    let threeViewerService: ThreeViewerService

    beforeEach(() => {
        ;({
            codeMapMouseEventService,
            threeRendererService,
            threeSceneService,
            labelSettingsFacade,
            tooltipService,
            viewCubeMouseEventsService,
            threeViewerService
        } = setUpCodeMapMouseEventService())
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

    describe("onExcludedNodesChanged", () => {
        function withSelectedPath(path: string | null) {
            jest.spyOn(codeMapMouseEventService["sharedViewReadWindow"], "getSelectedNodePath").mockReturnValue(path)
        }

        it("should deselect the selected node when it is excluded, even if the 3D map drew no building for it", () => {
            // Arrange
            withSelectedPath("/root/selectedInTheSunburst.ts")
            threeSceneService.getSelectedBuilding = jest.fn()

            // Act
            codeMapMouseEventService.onExcludedNodesChanged([{ path: "/root/selectedInTheSunburst.ts" }])

            // Assert
            expect(threeSceneService.clearSelection).toHaveBeenCalled()
        })

        it("should not deselect the selected node when it is not excluded", () => {
            // Arrange
            withSelectedPath(CODE_MAP_BUILDING.node.path)

            // Act
            codeMapMouseEventService.onExcludedNodesChanged([{ path: "/root/somethingElse.ts" }])

            // Assert
            expect(threeSceneService.clearSelection).not.toHaveBeenCalled()
        })

        it("should not deselect anything when nothing is selected", () => {
            // Arrange
            withSelectedPath(null)

            // Act
            codeMapMouseEventService.onExcludedNodesChanged([{ path: CODE_MAP_BUILDING.node.path }])

            // Assert
            expect(threeSceneService.clearSelection).not.toHaveBeenCalled()
        })
    })

    describe("changeCursorIndicator", () => {
        it("should set the mouseIcon to grabbing", () => {
            changeCursorIndicator(CursorType.Grabbing)

            expect(document.body.style.cursor).toEqual(CursorType.Grabbing)
        })

        it("should set the mouseIcon to default", () => {
            document.body.style.cursor = CursorType.Pointer

            changeCursorIndicator(CursorType.Default)

            expect(document.body.style.cursor).toEqual(CursorType.Default)
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
})
