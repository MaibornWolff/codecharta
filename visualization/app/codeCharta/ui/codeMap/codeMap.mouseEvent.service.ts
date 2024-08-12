import { Injectable, OnDestroy } from "@angular/core"
import { ThreeCameraService } from "./threeViewer/threeCamera.service"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { BlacklistItem, CcState } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeRendererService } from "./threeViewer/threeRenderer.service"
import { isPathHiddenOrExcluded } from "../../util/codeMapHelper"
import { hierarchy } from "d3-hierarchy"
import { Intersection, Object3D, Raycaster, Vector2 } from "three"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeViewerService } from "./threeViewer/threeViewer.service"
import { setHoveredNodeId } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { setRightClickedNodeData } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { idToNodeSelector } from "../../state/selectors/accumulatedData/idToNode.selector"
import { IdToBuildingService } from "../../services/idToBuilding/idToBuilding.service"
import { hoveredNodeIdSelector } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { tap } from "rxjs"
import { visibleFileStatesSelector } from "../../state/selectors/visibleFileStates.selector"
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

    private mouse: Coordinates = { x: 0, y: 0 }
    private oldMouse: Coordinates = { x: 0, y: 0 }
    private mouseOnLastClick: Coordinates = { x: 0, y: 0 }
    private isGrabbing = false
    private isMoving = false
    private raycaster = new Raycaster()
    private labelHoveredBuilding = null
    private labelSelectedBuilding = null
    private subscriptions = [
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
        private store: Store<CcState>,
        private state: State<CcState>,
        private codeMapLabelService: CodeMapLabelService,
        private viewCubeMouseEvents: ViewCubeMouseEventsService,
        private threeViewerService: ThreeViewerService,
        private idToBuilding: IdToBuildingService
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
        this.threeRendererService.renderer.domElement.addEventListener("mousemove", debounce(this.onDocumentMouseMove, 1))
        this.threeRendererService.renderer.domElement.addEventListener("mouseup", event => this.onDocumentMouseUp(event))
        this.threeRendererService.renderer.domElement.addEventListener("mousedown", event => this.onDocumentMouseDown(event))
        this.threeRendererService.renderer.domElement.addEventListener("dblclick", () => this.onDocumentDoubleClick())
        this.threeRendererService.renderer.domElement.addEventListener("mouseleave", event => this.onDocumentMouseLeave(event))
        this.threeRendererService.renderer.domElement.addEventListener("mouseenter", () => this.onDocumentMouseEnter())
        const debouncedHandleWheelEvent = debounce(this.handleWheelEvent.bind(this), 1)
        this.threeRendererService.renderer.domElement.addEventListener("wheel", debouncedHandleWheelEvent)
        this.viewCubeMouseEvents.subscribe("viewCubeEventPropagation", this.onViewCubeEventPropagation)
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
        this.clearLabelHoveredBuilding()
    }

    onBlacklistChanged(blacklist: BlacklistItem[]) {
        const selectedBuilding = this.threeSceneService.getSelectedBuilding()
        this.clearLabelHoveredBuilding()
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
            const labels = this.threeSceneService.labels?.children

            if (this.isGrabbingOrMoving()) {
                this.threeSceneService.resetLabel()
                this.clearLabelHoveredBuilding()
                this.threeRendererService.render()
                return
            }

            this.oldMouse.x = this.mouse.x
            this.oldMouse.y = this.mouse.y

            const mapMesh = this.threeSceneService.getMapMesh()

            if (mapMesh) {
                this.threeCameraService.camera.updateMatrixWorld(false)

                let nodeNameHoveredLabel = ""
                const mouseCoordinates = this.transformHTMLToSceneCoordinates()
                const camera = this.threeCameraService.camera

                if (camera.isPerspectiveCamera) {
                    this.raycaster.setFromCamera(mouseCoordinates as Vector2, camera)
                }

                const hoveredLabel = this.calculateHoveredLabel(labels)

                if (hoveredLabel) {
                    this.threeSceneService.animateLabel(hoveredLabel.object, this.raycaster, labels)
                    nodeNameHoveredLabel = hoveredLabel.object.userData.node.path
                }

                this.intersectedBuilding =
                    nodeNameHoveredLabel !== ""
                        ? mapMesh.getBuildingByPath(nodeNameHoveredLabel)
                        : mapMesh.checkMouseRayMeshIntersection(mouseCoordinates, camera)

                const from = this.threeSceneService.getHighlightedBuilding()
                const to = this.intersectedBuilding

                if (from?.id !== to?.id) {
                    this.clearLabelHoveredBuilding()

                    this.threeSceneService.resetLabel()
                    this.unhoverBuilding()
                    if (to && !this.isGrabbingOrMoving()) {
                        this.setLabelHoveredLeaf(to, labels)
                        this.hoverBuilding(to)
                    }
                }
            }
        }
    }

    setLabelHoveredLeaf(codeMapBuilding: CodeMapBuilding, labels: Object3D[]) {
        if (codeMapBuilding?.node?.isLeaf) {
            const labelForBuilding =
                this.threeSceneService.getLabelForHoveredNode(codeMapBuilding, labels) ?? this.drawLabelHoveredBuilding(codeMapBuilding)
            this.threeSceneService.animateLabel(labelForBuilding, this.raycaster, labels)
        }
    }

    drawLabelHoveredBuilding(codeMapBuilding: CodeMapBuilding) {
        const enforceLabel = true
        this.codeMapLabelService.addLeafLabel(codeMapBuilding.node, 0, enforceLabel)

        const labels = this.threeSceneService.labels?.children
        const labelForBuilding = this.threeSceneService.getLabelForHoveredNode(codeMapBuilding, labels)
        this.labelHoveredBuilding = codeMapBuilding.node

        return labelForBuilding
    }

    drawLabelSelectedBuilding(codeMapBuilding: CodeMapBuilding) {
        this.clearLabelHoveredBuilding()
        if (this.labelSelectedBuilding !== null) {
            this.codeMapLabelService.clearTemporaryLabel(this.labelSelectedBuilding)
        }
        if (!codeMapBuilding.node.isLeaf) {
            return
        }

        this.codeMapLabelService.addLeafLabel(codeMapBuilding.node, 0, true)

        const labels = this.threeSceneService.labels?.children
        const labelForBuilding = this.threeSceneService.getLabelForHoveredNode(codeMapBuilding, labels)
        this.threeSceneService.animateLabel(labelForBuilding, this.raycaster, labels)

        this.labelSelectedBuilding = codeMapBuilding.node
        return labelForBuilding
    }

    clearLabelHoveredBuilding() {
        if (this.labelHoveredBuilding !== null) {
            this.codeMapLabelService.clearTemporaryLabel(this.labelHoveredBuilding)
            this.labelHoveredBuilding = null
        }
    }

    private clearLabelSelectedBuilding() {
        if (this.labelSelectedBuilding !== null) {
            this.codeMapLabelService.clearTemporaryLabel(this.labelSelectedBuilding)
            this.labelSelectedBuilding = null
        }
    }

    private EnableOrbitalsRotation(isRotation: boolean) {
        this.threeViewerService.enableRotation(isRotation)
        this.viewCubeMouseEvents.enableRotation(isRotation)
    }

    onDocumentMouseEnter() {
        this.EnableOrbitalsRotation(true)
    }

    onDocumentMouseLeave(event: MouseEvent) {
        if (!(event.relatedTarget instanceof HTMLCanvasElement)) {
            this.EnableOrbitalsRotation(false)
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
        this.mouseOnLastClick = { x: event.clientX, y: event.clientY }
        ;(document.activeElement as HTMLElement).blur()
    }

    onDocumentMouseUp(event: MouseEvent) {
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

    private calculateHoveredLabel(labels: Object3D[]) {
        let labelClosestToViewPoint: Intersection | null = null

        for (let counter = 0; counter < labels?.length; counter += 2) {
            const intersect = this.raycaster.intersectObject(this.threeSceneService.labels.children[counter])
            if (intersect.length > 0) {
                if (labelClosestToViewPoint === null) {
                    labelClosestToViewPoint = intersect[0]
                } else {
                    labelClosestToViewPoint =
                        labelClosestToViewPoint.distance < intersect[0].distance ? labelClosestToViewPoint : intersect[0]
                }
            }
        }

        return labelClosestToViewPoint
    }

    private onRightClick() {
        this.isMoving = false
        // Check if mouse moved to prevent the node context menu to show up
        // after moving the map, when the cursor ends on a building.
        if (this.intersectedBuilding && !this.hasMouseMovedMoreThanThreePixels(this.mouseOnLastClick)) {
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
        if (!this.hasMouseMovedMoreThanThreePixels(this.mouseOnLastClick)) {
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

    private hasMouseMovedMoreThanThreePixels({ x, y }: Coordinates) {
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
                this.threeSceneService.addBuildingToHighlightingList(building)
            }
        }
        this.threeSceneService.highlightBuildings()
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

    handleWheelEvent(event: WheelEvent) {
        if (event.deltaY < 0) {
            //this.threeCameraService.zoomIn()
        } else {
            //this.threeCameraService.zoomOut()
        }
        this.threeRendererService.render()
    }
}
