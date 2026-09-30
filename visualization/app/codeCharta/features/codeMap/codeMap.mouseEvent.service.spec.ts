import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { CodeMapTooltipService } from "../../renderer/threeViewer/codeMap.tooltip.service"
import { CursorType, changeCursorIndicator } from "../../renderer/threeViewer/cursorIndicator"
import { CodeMapBuilding } from "../../renderer/threeViewer/rendering/codeMapBuilding"
import { CODE_MAP_BUILDING, CODE_MAP_BUILDING_TS_NODE } from "../../renderer/threeViewer/rendering/codeMapBuilding.mocks"
import { ThreeRendererService } from "../../renderer/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../../renderer/threeViewer/threeSceneService"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { CodeMapMouseEventTestContext, setUpCodeMapMouseEventService } from "./codeMap.mouseEvent.service.mocks"

jest.mock("../../renderer/renderModel/accumulatedData/idToNode.selector", () => ({
    idToNodeSelector: jest.fn()
}))

describe("codeMapMouseEventService", () => {
    let context: CodeMapMouseEventTestContext
    let codeMapMouseEventService: CodeMapMouseEventService
    let threeRendererService: ThreeRendererService
    let threeSceneService: ThreeSceneService
    let labelSettingsFacade: LabelSettingsFacade
    let tooltipService: CodeMapTooltipService
    let codeMapBuilding: CodeMapBuilding

    beforeEach(() => {
        context = setUpCodeMapMouseEventService()
        ;({ codeMapMouseEventService, threeRendererService, threeSceneService, labelSettingsFacade, tooltipService, codeMapBuilding } =
            context)
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

    describe("while the 3D map is not on screen", () => {
        beforeEach(() => {
            jest.spyOn(codeMapMouseEventService["threeMapVisibilityStore"], "isMapShown").mockReturnValue(false)
        })

        it("should neither highlight nor redraw the hidden 3D map on hover", () => {
            // Act
            codeMapMouseEventService.hoverNode("/root/a")
            codeMapMouseEventService.unhoverNode()

            // Assert
            expect(threeSceneService.addBuildingsToHighlightingList).not.toHaveBeenCalled()
            expect(threeSceneService.clearHighlight).not.toHaveBeenCalled()
            expect(threeRendererService.render).not.toHaveBeenCalled()
        })
    })

    describe("transformHTMLToSceneCoordinates", () => {
        beforeEach(() => {
            codeMapMouseEventService = context.rebuildService()
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

    describe("labelForSelectedBuilding", () => {
        it("should create a label when selecting a building", () => {
            // Arrange
            labelSettingsFacade.addSelectionLabel = jest.fn()
            labelSettingsFacade.clearSelectionLabel = jest.fn()
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(false)
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()

            // Act
            codeMapMouseEventService.drawLabelSelectedBuilding(codeMapBuilding)

            // Assert
            expect(tooltipService.hide).toHaveBeenCalled()
            expect(labelSettingsFacade.addSelectionLabel).toHaveBeenCalledWith(codeMapBuilding.node)
        })

        it("should not create a label when the building already has a persistent one", () => {
            // Arrange
            labelSettingsFacade.addSelectionLabel = jest.fn()
            labelSettingsFacade.clearSelectionLabel = jest.fn()
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(true)
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()

            // Act
            codeMapMouseEventService.drawLabelSelectedBuilding(codeMapBuilding)

            // Assert
            expect(labelSettingsFacade.addSelectionLabel).not.toHaveBeenCalled()
        })

        it("should remove the label when no building is selected anymore", () => {
            // Arrange
            labelSettingsFacade.clearSelectionLabel = jest.fn()
            codeMapMouseEventService["intersectedBuilding"] = undefined

            // Act
            codeMapMouseEventService["onLeftClick"]()

            // Assert
            expect(labelSettingsFacade.clearSelectionLabel).toHaveBeenCalled()
        })

        it("should keep the label hidden while the clicked building stays hovered", () => {
            // Arrange
            labelSettingsFacade.clearSelectionLabel = jest.fn()
            labelSettingsFacade.addSelectionLabel = jest.fn()
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()
            labelSettingsFacade.suppressLabelForNode = jest.fn()
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(true)
            codeMapMouseEventService["intersectedBuilding"] = codeMapBuilding

            // Act
            codeMapMouseEventService["onLeftClick"]()

            // Assert
            expect(labelSettingsFacade.suppressLabelForNode).toHaveBeenCalledWith(codeMapBuilding.node)
            expect(tooltipService.show).toHaveBeenCalledWith(codeMapBuilding.node, expect.any(Number), expect.any(Number))
        })

        it("should remove the old and create the new label when selected building is changed", () => {
            // Arrange
            const newSelection = CODE_MAP_BUILDING_TS_NODE
            labelSettingsFacade.clearSelectionLabel = jest.fn()
            labelSettingsFacade.addSelectionLabel = jest.fn()
            labelSettingsFacade.hasLabelForNode = jest.fn().mockReturnValue(false)
            labelSettingsFacade.restoreSuppressedLabel = jest.fn()
            codeMapMouseEventService.drawLabelSelectedBuilding(codeMapBuilding)

            // Act
            codeMapMouseEventService["intersectedBuilding"] = newSelection
            codeMapMouseEventService["onLeftClick"]()

            // Assert
            expect(labelSettingsFacade.clearSelectionLabel).toHaveBeenCalledTimes(2)
            expect(labelSettingsFacade.addSelectionLabel).toHaveBeenCalledWith(codeMapBuilding.node)
            expect(labelSettingsFacade.addSelectionLabel).toHaveBeenCalledWith(newSelection.node)
            expect(labelSettingsFacade.addSelectionLabel).toHaveBeenCalledTimes(2)
        })
    })
})
