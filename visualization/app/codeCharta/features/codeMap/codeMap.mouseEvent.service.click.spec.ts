import { Store } from "@ngrx/store"
import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { CcState, Node } from "../../model/codeCharta.model"
import { CursorType } from "../../renderer/threeViewer/cursorIndicator"
import { CodeMapBuilding } from "../../renderer/threeViewer/rendering/codeMapBuilding"
import { CODE_MAP_BUILDING } from "../../renderer/threeViewer/rendering/codeMapBuilding.mocks"
import { ThreeSceneService } from "../../renderer/threeViewer/threeSceneService"
import { setRightClickedNodeData } from "../../stores/sharedView/sharedView.write.facade"
import { ViewCubeMouseEventsService } from "../viewCube/facade"
import { ClickType, CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { setUpCodeMapMouseEventService } from "./codeMap.mouseEvent.service.mocks"

jest.mock("../../renderer/renderModel/accumulatedData/idToNode.selector", () => ({
    idToNodeSelector: jest.fn()
}))

describe("codeMapMouseEventService", () => {
    let codeMapMouseEventService: CodeMapMouseEventService
    let threeSceneService: ThreeSceneService
    let store: Store<CcState>
    let labelSettingsFacade: LabelSettingsFacade
    let viewCubeMouseEventsService: ViewCubeMouseEventsService
    let codeMapBuilding: CodeMapBuilding

    beforeEach(() => {
        ;({ codeMapMouseEventService, threeSceneService, store, labelSettingsFacade, viewCubeMouseEventsService, codeMapBuilding } =
            setUpCodeMapMouseEventService())
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
                codeMapMouseEventService["intersectedBuilding"] = { node: { id: 1, path: "/root/File.ts" } } as CodeMapBuilding
                codeMapMouseEventService.onDocumentMouseDown(event)

                codeMapMouseEventService.onDocumentMouseUp(event)

                expect(dispatchSpy).toHaveBeenCalledWith(
                    setRightClickedNodeData({
                        value: {
                            nodeId: "/root/File.ts",
                            xPositionOfRightClickEvent: 0,
                            yPositionOfRightClickEvent: 1,
                            origin: "codeMap"
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
})
