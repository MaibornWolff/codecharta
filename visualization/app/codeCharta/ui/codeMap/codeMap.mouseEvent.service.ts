import { MapTreeViewHoverEventSubscriber, MapTreeViewLevelController } from "../mapTreeView/mapTreeView.level.component"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { IRootScopeService, IWindowService } from "angular"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import $ from "jquery"
import { ViewCubeEventPropagationSubscriber, ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapNode, BlacklistItem } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { isPathHiddenOrExcluded } from "../../util/codeMapHelper"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { StoreService } from "../../state/store.service"
import { hierarchy } from "d3-hierarchy"
import { Object3D, Raycaster } from "three"
import { CodeMapLabelService } from "./codeMap.label.service"
import { LazyLoader } from "../../util/lazyLoader"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"

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

export interface BuildingRightClickedEventSubscriber {
	onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number)
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

export class CodeMapMouseEventService
	implements MapTreeViewHoverEventSubscriber, ViewCubeEventPropagationSubscriber, FilesSelectionSubscriber, BlacklistSubscriber {
	private static readonly BUILDING_HOVERED_EVENT = "building-hovered"
	private static readonly BUILDING_UNHOVERED_EVENT = "building-unhovered"
	private static readonly BUILDING_RIGHT_CLICKED_EVENT = "building-right-clicked"
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

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private $window: IWindowService,
		private threeCameraService: ThreeCameraService,
		private threeRendererService: ThreeRendererService,
		private threeSceneService: ThreeSceneService,
		private threeUpdateCycleService: ThreeUpdateCycleService,
		private storeService: StoreService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapPreRenderService: CodeMapPreRenderService
	) {
		this.threeUpdateCycleService.register(() => this.updateHovering())
		MapTreeViewLevelController.subscribeToHoverEvents(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
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

	static subscribeToBuildingRightClickedEvents($rootScope: IRootScopeService, subscriber: BuildingRightClickedEventSubscriber) {
		$rootScope.$on(this.BUILDING_RIGHT_CLICKED_EVENT, (_event, data) => {
			subscriber.onBuildingRightClicked(data.building, data.x, data.y)
		})
	}

	start() {
		// TODO: Check if these event listeners should ever be removed again.
		this.threeRendererService.renderer.domElement.addEventListener("mousemove", event => this.onDocumentMouseMove(event))
		this.threeRendererService.renderer.domElement.addEventListener("mouseup", event => this.onDocumentMouseUp(event))
		this.threeRendererService.renderer.domElement.addEventListener("mousedown", event => this.onDocumentMouseDown(event))
		this.threeRendererService.renderer.domElement.addEventListener("dblclick", () => this.onDocumentDoubleClick())
		ViewCubeMouseEventsService.subscribeToEventPropagation(this.$rootScope, this)
	}

	onShouldHoverNode({ path }: CodeMapNode) {
		const { buildings } = this.threeSceneService.getMapMesh().getMeshDescription()
		for (const building of buildings) {
			if (building.node.path === path) {
				this.hoverBuilding(building)
				this.highlightedInTreeView = building
			}
		}
	}

	onShouldUnhoverNode() {
		this.unhoverBuilding()
		this.highlightedInTreeView = null
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
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		const selectedBuilding = this.threeSceneService.getSelectedBuilding()
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
			if (this.isGrabbing || this.isMoving) {
				this.threeSceneService.resetLabel()
				this.clearTemporaryLabel()
				return
			}

			this.oldMouse.x = this.mouse.x
			this.oldMouse.y = this.mouse.y

			const mouseCoordinates = this.transformHTMLToSceneCoordinates()
			const camera = this.threeCameraService.camera
			const labels = this.threeSceneService.labels?.children

			const mapMesh = this.threeSceneService.getMapMesh()
			let nodeNameHoveredLabel = ""

			this.threeCameraService.camera.updateMatrixWorld(false)

			if (mapMesh) {
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
					if (to) {
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
	}

	private drawTemporaryLabelFor(codeMapBuilding: CodeMapBuilding, labels: Object3D[]) {
		const appSettings = this.storeService.getState().appSettings
		const showLabelNodeName = appSettings.showMetricLabelNodeName
		const showLabelNodeMetric = appSettings.showMetricLabelNameValue

		this.codeMapLabelService.addLabel(codeMapBuilding.node, {
			showNodeName: showLabelNodeName,
			showNodeMetric: showLabelNodeMetric
		})

		labels = this.threeSceneService.labels?.children
		const labelForBuilding = this.threeSceneService.getLabelForHoveredNode(codeMapBuilding, labels)
		this.temporaryLabelForBuilding = codeMapBuilding.node

		return labelForBuilding
	}

	onDocumentMouseMove(event: MouseEvent) {
		this.mouse.x = event.clientX
		this.mouse.y = event.clientY
	}

	onDocumentDoubleClick() {
		const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()
		const selectedBuilding = this.threeSceneService.getSelectedBuilding()
		// check if mouse moved to prevent opening the building link after rotating the map, when the cursor ends on a building
		if (highlightedBuilding && !this.hasMouseMoved(this.mouseOnLastClick)) {
			const fileSourceLink = highlightedBuilding.node.link
			if (fileSourceLink) {
				this.$window.open(fileSourceLink, "_blank")
			}
		}
		if (selectedBuilding?.node.isLeaf) {
			const sourceLink = selectedBuilding.node.link
			if (sourceLink) {
				this.$window.open(sourceLink, "_blank")
				return
			}
			const fileName = this.codeMapPreRenderService.getRenderFileMeta().fileName
			if (fileName) {
				LazyLoader.openFile(fileName, selectedBuilding.node.path)
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
		this.unhoverBuilding()
		$(document.activeElement).blur()
	}

	onDocumentMouseUp(event: MouseEvent) {
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
		let labelClosestToViewPoint = null

		if (labels != null) {
			for (let counter = 0; counter < labels.length; counter += 2) {
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
	}

	private onRightClick() {
		this.isMoving = false
		const building = this.intersectedBuilding
		// check if mouse moved to prevent the node context menu to show up after moving the map, when the cursor ends on a building
		if (building && !this.hasMouseMovedMoreThanThreePixels(this.mouseOnLastClick)) {
			this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_RIGHT_CLICKED_EVENT, {
				building,
				x: this.mouse.x,
				y: this.mouse.y
			})
			this.hoverBuilding(building)
		}
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

	private hoverBuilding(hoveredBuilding: CodeMapBuilding) {
		if (hoveredBuilding) {
			this.hoverBuildingAndChildren(hoveredBuilding)
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

	private hoverBuildingAndChildren(hoveredBuilding: CodeMapBuilding) {
		if (!this.isGrabbing && !this.isMoving) {
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Pointer)

			const { lookUp } = this.storeService.getState()
			const codeMapNode = lookUp.idToNode.get(hoveredBuilding.node.id)
			for (const { data } of hierarchy(codeMapNode)) {
				const building = lookUp.idToBuilding.get(data.id)
				if (building) {
					this.threeSceneService.addBuildingToHighlightingList(building)
				}
			}
			this.threeSceneService.highlightBuildings()
			this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_HOVERED_EVENT, { hoveredBuilding })
		}
	}

	private unhoverBuilding() {
		if (!this.isMoving && !this.isGrabbing) {
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
		}

		if (this.threeSceneService.getConstantHighlight().size > 0) {
			this.threeSceneService.clearHoverHighlight()
		} else {
			this.threeSceneService.clearHighlight()
		}

		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_UNHOVERED_EVENT)
	}
}
