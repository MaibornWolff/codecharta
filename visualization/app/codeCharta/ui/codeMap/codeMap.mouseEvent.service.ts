import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { IRootScopeService, IWindowService } from "angular"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { ViewCubeEventPropagationSubscriber, ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { BlacklistItem } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { isPathHiddenOrExcluded } from "../../util/codeMapHelper"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { StoreService } from "../../state/store.service"
import { hierarchy } from "d3-hierarchy"
import { Intersection, Object3D, Raycaster } from "three"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeViewerService } from "./threeViewer/threeViewerService"
import { setHoveredBuildingPath } from "../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"
import { hoveredBuildingPathSelector } from "../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.selector"
import { setRightClickedNodeData } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"
import { idToNodeSelector } from "../../state/selectors/accumulatedData/idToNode.selector"
import { IdToBuildingService } from "../../services/idToBuilding/idToBuilding.service"

interface Coordinates {
	x: number
	y: number
}

export interface BuildingHoveredSubscriber {
	onBuildingHovered(hoveredBuilding: CodeMapBuilding)
}

export interface BuildingUnhoveredSubscriber {
	onBuildingUnhovered()
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

export class CodeMapMouseEventService implements ViewCubeEventPropagationSubscriber, FilesSelectionSubscriber, BlacklistSubscriber {
	private static readonly BUILDING_HOVERED_EVENT = "building-hovered"
	private static readonly BUILDING_UNHOVERED_EVENT = "building-unhovered"
	private readonly THRESHOLD_FOR_MOUSE_MOVEMENT_TRACKING = 3

	private highlightedInTreeView: CodeMapBuilding
	private intersectedBuilding: CodeMapBuilding

	private mouse: Coordinates = { x: 0, y: 0 }
	private oldMouse: Coordinates = { x: 0, y: 0 }
	private mouseOnLastClick: Coordinates = { x: 0, y: 0 }
	private isGrabbing = false
	private isMoving = false
	private raycaster = new Raycaster()
	private temporaryLabelForBuilding = null
	private hoveredBuildingPath: string | null = null

	constructor(
		private $rootScope: IRootScopeService,
		private $window: IWindowService,
		private threeCameraService: ThreeCameraService,
		private threeRendererService: ThreeRendererService,
		private threeSceneService: ThreeSceneService,
		private threeUpdateCycleService: ThreeUpdateCycleService,
		private storeService: StoreService,
		private codeMapLabelService: CodeMapLabelService,
		private viewCubeMouseEventsService: ViewCubeMouseEventsService,
		private threeViewerService: ThreeViewerService,
		private idToBuilding: IdToBuildingService
	) {
		"ngInject"
		this.threeUpdateCycleService.register(() => this.threeRendererService.render())
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)

		this.storeService["store"].subscribe(() => {
			const state = this.storeService["store"].getState()
			const hoveredBuildingPath = hoveredBuildingPathSelector(state)
			if (this.hoveredBuildingPath === hoveredBuildingPath) return

			this.hoveredBuildingPath = hoveredBuildingPath

			if (this.hoveredBuildingPath) {
				this.hoverNode(this.hoveredBuildingPath)
			} else {
				this.unhoverNode()
			}
		})
	}

	static changeCursorIndicator(cursorIcon: CursorType) {
		document.body.style.cursor = cursorIcon
	}

	static subscribeToBuildingHovered($rootScope: IRootScopeService, subscriber: BuildingHoveredSubscriber) {
		$rootScope.$on(this.BUILDING_HOVERED_EVENT, (_event, data) => {
			subscriber.onBuildingHovered(data.hoveredBuilding)
		})
	}

	static subscribeToBuildingUnhovered($rootScope: IRootScopeService, subscriber: BuildingUnhoveredSubscriber) {
		$rootScope.$on(this.BUILDING_UNHOVERED_EVENT, () => {
			subscriber.onBuildingUnhovered()
		})
	}

	start() {
		// TODO: Check if these event listeners should ever be removed again.
		this.threeRendererService.renderer.domElement.addEventListener("mousemove", event => this.onDocumentMouseMove(event))
		this.threeRendererService.renderer.domElement.addEventListener("mouseup", event => this.onDocumentMouseUp(event))
		this.threeRendererService.renderer.domElement.addEventListener("mousedown", event => this.onDocumentMouseDown(event))
		this.threeRendererService.renderer.domElement.addEventListener("dblclick", () => this.onDocumentDoubleClick())
		this.threeRendererService.renderer.domElement.addEventListener("mouseleave", event => this.onDocumentMouseLeave(event))
		this.threeRendererService.renderer.domElement.addEventListener("mouseenter", () => this.onDocumentMouseEnter())
		ViewCubeMouseEventsService.subscribeToEventPropagation(this.$rootScope, this)
	}

	hoverNode(path: string) {
		if (this.isGrabbingOrMoving()) {
			return
		}
		const { buildings } = this.threeSceneService.getMapMesh().getMeshDescription()
		for (const building of buildings) {
			if (building.node.path === path) {
				this.hoverBuilding(building)
				this.highlightedInTreeView = building
				break
			}
		}
		this.threeUpdateCycleService.update()
	}

	unhoverNode() {
		this.unhoverBuilding()
		this.highlightedInTreeView = null
		this.threeUpdateCycleService.update()
	}

	onViewCubeEventPropagation(eventType: string, event: MouseEvent) {
		switch (eventType) {
			case "mousemove":
				this.onDocumentMouseMove(event)
				break
			case "mouseup":
				this.onDocumentMouseUp(event)
				break
			case "mousedown":
				this.onDocumentMouseDown(event)
				break
			case "dblclick":
				this.onDocumentDoubleClick()
				break
		}
	}

	onFilesSelectionChanged() {
		this.threeSceneService.clearSelection()
		this.threeSceneService.clearConstantHighlight()
		this.clearTemporaryLabel()
		this.threeUpdateCycleService.update()
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		const selectedBuilding = this.threeSceneService.getSelectedBuilding()
		this.clearTemporaryLabel()
		if (selectedBuilding) {
			const isSelectedBuildingBlacklisted = isPathHiddenOrExcluded(selectedBuilding.node.path, blacklist)

			if (isSelectedBuildingBlacklisted) {
				this.threeSceneService.clearSelection()
			}
		}
		this.unhoverBuilding()
	}

	private clearTemporaryLabel() {
		if (this.temporaryLabelForBuilding !== null) {
			this.codeMapLabelService.clearTemporaryLabel(this.temporaryLabelForBuilding)
			this.temporaryLabelForBuilding = null
		}
	}

	updateHovering() {
		if (this.hasMouseMoved(this.oldMouse)) {
			const labels = this.threeSceneService.labels?.children

			if (this.isGrabbingOrMoving()) {
				this.threeSceneService.resetLabel()
				this.clearTemporaryLabel()
				this.threeUpdateCycleService.update()
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
					this.raycaster.setFromCamera(mouseCoordinates, camera)
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
				const to = this.intersectedBuilding ?? this.highlightedInTreeView

				if (from !== to) {
					if (this.temporaryLabelForBuilding !== null) {
						this.codeMapLabelService.clearTemporaryLabel(this.temporaryLabelForBuilding)
						this.temporaryLabelForBuilding = null
					}

					this.threeSceneService.resetLabel()
					this.unhoverBuilding()
					if (to && !this.isGrabbingOrMoving()) {
						if (to.node.isLeaf) {
							const labelForBuilding =
								this.threeSceneService.getLabelForHoveredNode(to, labels) ?? this.drawTemporaryLabelFor(to, labels)
							this.threeSceneService.animateLabel(labelForBuilding, this.raycaster, labels)
						}
						this.hoverBuilding(to)
					}
				}
			}
		}
		this.threeUpdateCycleService.update()
	}

	private drawTemporaryLabelFor(codeMapBuilding: CodeMapBuilding, labels: Object3D[]) {
		const enforceLabel = true
		this.codeMapLabelService.addLabel(codeMapBuilding.node, 0, enforceLabel)

		labels = this.threeSceneService.labels?.children
		const labelForBuilding = this.threeSceneService.getLabelForHoveredNode(codeMapBuilding, labels)
		this.temporaryLabelForBuilding = codeMapBuilding.node

		return labelForBuilding
	}

	private EnableOrbitalsRotation(isRotation: boolean) {
		this.threeViewerService.enableRotation(isRotation)
		this.viewCubeMouseEventsService.enableRotation(isRotation)
	}

	onDocumentMouseEnter() {
		this.EnableOrbitalsRotation(true)
	}

	onDocumentMouseLeave(event: MouseEvent) {
		if (!(event.relatedTarget instanceof HTMLCanvasElement)) this.EnableOrbitalsRotation(false)
	}

	onDocumentMouseMove(event: MouseEvent) {
		this.mouse.x = event.clientX
		this.mouse.y = event.clientY
		this.updateHovering()
		this.viewCubeMouseEventsService.propagateMovement()
	}

	onDocumentDoubleClick() {
		const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()
		const selectedBuilding = this.threeSceneService.getSelectedBuilding()
		// Check if mouse moved to prevent opening the building link after
		// rotating the map, when the cursor ends on a building.
		const fileSourceLink = highlightedBuilding?.node.link
		if (fileSourceLink && !this.hasMouseMoved(this.mouseOnLastClick)) {
			this.$window.open(fileSourceLink, "_blank")
		}
		if (selectedBuilding?.node.isLeaf) {
			const sourceLink = selectedBuilding.node.link
			if (sourceLink) {
				this.$window.open(sourceLink, "_blank")
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
		this.viewCubeMouseEventsService.resetIsDragging()
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
		const building = this.intersectedBuilding
		// Check if mouse moved to prevent the node context menu to show up
		// after moving the map, when the cursor ends on a building.
		if (building && !this.hasMouseMovedMoreThanThreePixels(this.mouseOnLastClick)) {
			this.storeService.dispatch(
				setRightClickedNodeData({
					nodeId: building.node.id,
					xPositionOfRightClickEvent: this.mouse.x,
					yPositionOfRightClickEvent: this.mouse.y
				})
			)
		}
		this.threeUpdateCycleService.update()
	}

	private onLeftClick() {
		this.isGrabbing = false
		if (!this.hasMouseMovedMoreThanThreePixels(this.mouseOnLastClick)) {
			this.threeSceneService.clearSelection()
			this.threeSceneService.clearConstantHighlight()
			if (this.intersectedBuilding) {
				this.threeSceneService.selectBuilding(this.intersectedBuilding)
			}
		}
		this.threeUpdateCycleService.update()
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

	private hoverBuilding(hoveredBuilding: CodeMapBuilding) {
		CodeMapMouseEventService.changeCursorIndicator(CursorType.Pointer)

		const idToNode = idToNodeSelector(this.storeService.getState())
		const codeMapNode = idToNode.get(hoveredBuilding.node.id)
		for (const { data } of hierarchy(codeMapNode)) {
			const building = this.idToBuilding.get(data.id)
			if (building) {
				this.threeSceneService.addBuildingToHighlightingList(building)
			}
		}
		this.threeSceneService.highlightBuildings()
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_HOVERED_EVENT, { hoveredBuilding })
		if (this.hoveredBuildingPath !== hoveredBuilding.node.path) {
			this.hoveredBuildingPath = hoveredBuilding.node.path
			this.storeService.dispatch(setHoveredBuildingPath(hoveredBuilding.node.path))
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

	private unhoverBuilding() {
		if (!this.isGrabbingOrMoving()) {
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
		}

		if (this.threeSceneService.getConstantHighlight().size > 0) {
			this.threeSceneService.clearHoverHighlight()
		} else {
			this.threeSceneService.clearHighlight()
		}

		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_UNHOVERED_EVENT)
		this.hoveredBuildingPath = null
		this.storeService.dispatch(setHoveredBuildingPath(null))
	}
}
