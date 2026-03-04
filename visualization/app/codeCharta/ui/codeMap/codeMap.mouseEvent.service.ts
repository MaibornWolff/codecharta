import { Injectable, OnDestroy } from "@angular/core"
import { ThreeCameraService } from "./threeViewer/threeCamera.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { BlacklistItem, CcState, Node } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeRendererService } from "./threeViewer/threeRenderer.service"
import { isPathHiddenOrExcluded } from "../../util/codeMapHelper"
import { hierarchy } from "d3-hierarchy"
import { Raycaster, Vector2 } from "three"
import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { CodeMapTooltipService } from "./codeMap.tooltip.service"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { setHoveredNodeId } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { setRightClickedNodeData } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { idToNodeSelector } from "../../state/selectors/accumulatedData/idToNode.selector"
import { IdToBuildingService } from "../../services/idToBuilding/idToBuilding.service"
import { hoveredNodeIdSelector } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { tap } from "rxjs"
import { visibleFileStatesSelector } from "../../state/selectors/visibleFileStates/visibleFileStates.selector"
import { blacklistSelector } from "../../state/store/fileSettings/blacklist/blacklist.selector"
import { debounce } from "../../util/debounce"
import { Store, State } from "@ngrx/store"

interface Coordinates {
    x: number
    y: number
}

export enum ClickType {
    LeftClick = 0,
    RightClick = 2
}

export enum CursorType {
    Default = "default",
    Grabbing = "grabbing",
    Pointer = "pointer",
    Moving = "move"
}

@Injectable({ providedIn: "root" })
export class CodeMapMouseEventService implements OnDestroy {
    private readonly THRESHOLD_FOR_MOUSE_MOVEMENT_TRACKING = 3

    private intersectedBuilding: CodeMapBuilding

    private readonly mouse: Coordinates = { x: 0, y: 0 }
    private oldMouse: Coordinates = { x: 0, y: 0 }
    private mouseOnLastClick: Coordinates = { x: 0, y: 0 }
    private isGrabbing = false
    private isMoving = false
    private readonly raycaster = new Raycaster()
    private labelSelectedBuilding: Node | null = null
    private readonly subscriptions = [
        this.store
            .select(visibleFileStatesSelector)
            .pipe(tap(() => this.onFilesSelectionChanged()))
            .subscribe(),
        this.store
            .select(blacklistSelector)
            .pipe(tap(blacklist => this.onBlacklistChanged(blacklist)))
            .subscribe(),
        this.store
            .select(hoveredNodeIdSelector)
            .pipe(
                tap(hoveredNodeId => {
                    if (hoveredNodeId !== null) {
                        this.hoverNode(hoveredNodeId)
                    } else {
                        this.unhoverNode(false)
                    }
                })
            )
            .subscribe()
    ]

    constructor(
        private threeCameraService: ThreeCameraService,
        private threeRendererService: ThreeRendererService,
        private threeSceneService: ThreeSceneService,
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>,
        private readonly labelSettingsFacade: LabelSettingsFacade,
        private readonly tooltipService: CodeMapTooltipService,
        private readonly viewCubeMouseEvents: ViewCubeMouseEventsService,
        private readonly threeViewerService: ThreeViewerService,
        private readonly idToBuilding: IdToBuildingService
    ) {}

    ngOnDestroy(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe()
        }
    }

    static changeCursorIndicator(cursorIcon: CursorType) {
        document.body.style.cursor = cursorIcon
    }

    start() {
        this.registerEventListeners()
        this.viewCubeMouseEvents.subscribe("viewCubeEventPropagation", this.onViewCubeEventPropagation)
    }

    private registerEventListeners() {
        const domElement = this.threeRendererService.renderer.domElement
        domElement.addEventListener("mousemove", this.onDocumentMouseMove)
        domElement.addEventListener("mouseup", event => this.onDocumentMouseUp(event))
        domElement.addEventListener("mousedown", event => this.onDocumentMouseDown(event))
        domElement.addEventListener("dblclick", () => this.onDocumentDoubleClick())
        domElement.addEventListener("mouseleave", event => this.onDocumentMouseLeave(event))
        domElement.addEventListener("mouseenter", () => this.onDocumentMouseEnter())
        domElement.addEventListener(
            "wheel",
            debounce(() => this.threeRendererService.render())
        )
    }

    hoverNode(id: number) {
        if (this.isGrabbingOrMoving()) {
            return
        }

        const { buildings } = this.threeSceneService.getMapMesh().getMeshDescription()
        for (const building of buildings) {
            if (building.node.id === id) {
                this.hoverBuilding(building, false)
                break
            }
        }
        this.threeRendererService.render()
    }

    unhoverNode(updateStore = true) {
        this.unhoverBuilding(updateStore)
        this.threeRendererService.render()
    }

    onViewCubeEventPropagation = (data: { type: string; event: MouseEvent }) => {
        switch (data.type) {
            case "mousemove":
                this.onDocumentMouseMove(data.event)
                break
            case "mouseup":
                this.onDocumentMouseUp(data.event)
                break
            case "mousedown":
                this.onDocumentMouseDown(data.event)
                break
            case "dblclick":
                this.onDocumentDoubleClick()
                break
        }
    }

    onFilesSelectionChanged() {
        this.threeSceneService.clearSelection()
        this.threeSceneService.clearConstantHighlight()
        this.tooltipService.hide()
    }

    onBlacklistChanged(blacklist: BlacklistItem[]) {
        const selectedBuilding = this.threeSceneService.getSelectedBuilding()
        this.tooltipService.hide()
        if (selectedBuilding) {
            const isSelectedBuildingBlacklisted = isPathHiddenOrExcluded(selectedBuilding.node.path, blacklist)

            if (isSelectedBuildingBlacklisted) {
                this.threeSceneService.clearSelection()
            }
        }
        this.unhoverBuilding()
    }

    updateHovering() {
        if (this.hasMouseMoved(this.oldMouse)) {
            if (this.isGrabbingOrMoving()) {
                this.tooltipService.hide()
                this.labelSettingsFacade.restoreSuppressedLabel()
                this.threeRendererService.render()
                return
            }

            this.oldMouse.x = this.mouse.x
            this.oldMouse.y = this.mouse.y

            const mapMesh = this.threeSceneService.getMapMesh()

            if (mapMesh) {
                this.threeCameraService.camera.updateMatrixWorld(false)

                const mouseCoordinates = this.transformHTMLToSceneCoordinates()
                const camera = this.threeCameraService.camera

                if (camera.isPerspectiveCamera) {
                    this.raycaster.setFromCamera(mouseCoordinates as Vector2, camera)
                }

                this.intersectedBuilding = mapMesh.checkMouseRayMeshIntersection(mouseCoordinates, camera)

                const from = this.threeSceneService.getHighlightedBuilding()
                const to = this.intersectedBuilding

                if (from?.id !== to?.id) {
                    this.tooltipService.hide()
                    this.labelSettingsFacade.restoreSuppressedLabel()
                    if (from && to && !this.isGrabbingOrMoving()) {
                        // Differential path: transition directly from one highlight to another
                        this.threeSceneService.prepareHighlightTransition()
                        this.showTooltipForBuilding(to)
                        this.hoverBuilding(to)
                    } else {
                        this.unhoverBuilding()
                        if (to && !this.isGrabbingOrMoving()) {
                            this.showTooltipForBuilding(to)
                            this.hoverBuilding(to)
                        }
                    }
                } else if (to && this.tooltipService.isVisible()) {
                    this.tooltipService.updatePosition(this.mouse.x, this.mouse.y)
                }
            }
        }
    }

    drawLabelSelectedBuilding(codeMapBuilding: CodeMapBuilding) {
        this.tooltipService.hide()
        this.labelSettingsFacade.restoreSuppressedLabel()
        if (this.labelSelectedBuilding !== null) {
            this.labelSettingsFacade.clearTemporaryLabel(this.labelSelectedBuilding)
        }
        if (!codeMapBuilding?.node?.isLeaf) {
            return
        }

        if (!this.labelSettingsFacade.hasLabelForNode(codeMapBuilding.node)) {
            this.labelSettingsFacade.addLeafLabel(codeMapBuilding.node, 0, true)
        }
        this.labelSelectedBuilding = codeMapBuilding.node
    }

    private showTooltipForBuilding(building: CodeMapBuilding) {
        if (this.labelSettingsFacade.hasLabelForNode(building.node)) {
            this.labelSettingsFacade.suppressLabelForNode(building.node)
        }
        this.tooltipService.show(building.node, this.mouse.x, this.mouse.y)
    }

    private clearLabelSelectedBuilding() {
        if (this.labelSelectedBuilding !== null) {
            this.labelSettingsFacade.clearTemporaryLabel(this.labelSelectedBuilding)
            this.labelSelectedBuilding = null
        }
    }

    private enableOrbitalsRotation(isRotation: boolean) {
        this.threeViewerService.enableRotation(isRotation)
        this.viewCubeMouseEvents.enableRotation(isRotation)
    }

    onDocumentMouseEnter() {
        this.enableOrbitalsRotation(true)
    }

    onDocumentMouseLeave(event: MouseEvent) {
        this.labelSettingsFacade.setSuppressLayout(false)
        this.tooltipService.hide()
        this.labelSettingsFacade.restoreSuppressedLabel()
        this.unhoverBuilding()
        if (!(event.relatedTarget instanceof HTMLCanvasElement)) {
            this.enableOrbitalsRotation(false)
        }
    }

    onDocumentMouseMove = (event: MouseEvent) => {
        this.mouse.x = event.clientX
        this.mouse.y = event.clientY
        this.updateHovering()
        this.viewCubeMouseEvents.propagateMovement()
    }

    onDocumentDoubleClick() {
        const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()
        const selectedBuilding = this.threeSceneService.getSelectedBuilding()
        // Check if mouse moved to prevent opening the building link after
        // rotating the map, when the cursor ends on a building.
        const fileSourceLink = highlightedBuilding?.node.link
        if (fileSourceLink && !this.hasMouseMoved(this.mouseOnLastClick)) {
            window.open(fileSourceLink, "_blank")
        }
        if (selectedBuilding?.node.isLeaf) {
            const sourceLink = selectedBuilding.node.link
            if (sourceLink) {
                window.open(sourceLink, "_blank")
                return
            }
        }
    }

    onDocumentMouseDown(event: MouseEvent) {
        if (event.button === ClickType.RightClick) {
            this.isMoving = true
            CodeMapMouseEventService.changeCursorIndicator(CursorType.Moving)
        }
        if (event.button === ClickType.LeftClick) {
            this.isGrabbing = true
            CodeMapMouseEventService.changeCursorIndicator(CursorType.Grabbing)
        }
        this.labelSettingsFacade.setSuppressLayout(true)
        this.tooltipService.hide()
        this.labelSettingsFacade.restoreSuppressedLabel()
        this.mouseOnLastClick = { x: event.clientX, y: event.clientY }
        ;(document.activeElement as HTMLElement).blur()
    }

    onDocumentMouseUp(event: MouseEvent) {
        this.labelSettingsFacade.setSuppressLayout(false)
        this.viewCubeMouseEvents.resetIsDragging()
        if (event.button === ClickType.LeftClick) {
            this.onLeftClick()
        } else {
            this.onRightClick()
        }
        if (this.intersectedBuilding !== undefined) {
            CodeMapMouseEventService.changeCursorIndicator(CursorType.Pointer)
        } else {
            CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
        }
    }

    private onRightClick() {
        this.isMoving = false
        // Check if mouse moved to prevent the node context menu to show up
        // after moving the map, when the cursor ends on a building.
        if (this.intersectedBuilding && !this.hasMouseMovedBeyondThreshold(this.mouseOnLastClick)) {
            this.store.dispatch(
                setRightClickedNodeData({
                    value: {
                        nodeId: this.intersectedBuilding.node.id,
                        xPositionOfRightClickEvent: this.mouse.x,
                        yPositionOfRightClickEvent: this.mouse.y
                    }
                })
            )
        }
        this.threeRendererService.render()
    }

    private onLeftClick() {
        this.isGrabbing = false
        if (!this.hasMouseMovedBeyondThreshold(this.mouseOnLastClick)) {
            if (this.intersectedBuilding) {
                this.threeSceneService.selectBuilding(this.intersectedBuilding)
                this.drawLabelSelectedBuilding(this.intersectedBuilding)
            } else {
                this.threeSceneService.clearSelection()
                this.clearLabelSelectedBuilding()
            }
            this.threeSceneService.clearConstantHighlight()
        }
        this.threeRendererService.render()
    }

    private hasMouseMovedBeyondThreshold({ x, y }: Coordinates) {
        return (
            Math.abs(this.mouse.x - x) > this.THRESHOLD_FOR_MOUSE_MOVEMENT_TRACKING ||
            Math.abs(this.mouse.y - y) > this.THRESHOLD_FOR_MOUSE_MOVEMENT_TRACKING
        )
    }

    private hasMouseMoved({ x, y }: Coordinates) {
        return this.mouse.x !== x || this.mouse.y !== y
    }

    private isGrabbingOrMoving() {
        return this.isGrabbing || this.isMoving
    }

    private hoverBuilding(hoveredBuilding: CodeMapBuilding, updateStore = true) {
        CodeMapMouseEventService.changeCursorIndicator(CursorType.Pointer)

        const idToNode = idToNodeSelector(this.state.getValue())
        const codeMapNode = idToNode.get(hoveredBuilding.node.id)
        for (const { data } of hierarchy(codeMapNode)) {
            const building = this.idToBuilding.get(data.id)
            if (building) {
                this.threeSceneService.addBuildingsToHighlightingList(building)
            }
        }
        this.threeSceneService.applyHighlights()
        if (updateStore) {
            this.store.dispatch(setHoveredNodeId({ value: hoveredBuilding.node.id }))
        }
    }

    private transformHTMLToSceneCoordinates(): Coordinates {
        const {
            renderer,
            renderer: { domElement }
        } = this.threeRendererService

        const pixelRatio = renderer.getPixelRatio()
        const rect = domElement.getBoundingClientRect()
        const x = (this.mouse.x / domElement.width) * pixelRatio * 2 - 1
        const y = -(((this.mouse.y - rect.top) / domElement.height) * pixelRatio) * 2 + 1
        return { x, y }
    }

    private unhoverBuilding(updateStore = true) {
        if (!this.isGrabbingOrMoving()) {
            CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
        }

        if (this.threeSceneService.getConstantHighlight().size > 0) {
            this.threeSceneService.clearHoverHighlight()
        } else {
            this.threeSceneService.clearHighlight()
        }

        if (updateStore) {
            this.store.dispatch(setHoveredNodeId({ value: null }))
        }
    }
}
