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
import { CodeMapHelper } from "../../util/codeMapHelper"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import { FilesService, FilesSelectionSubscriber } from "../../state/store/files/files.service"
import { StoreService } from "../../state/store.service"
import { hierarchy } from "d3-hierarchy"
import { NodeContextMenuController } from "../nodeContextMenu/nodeContextMenu.component"

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

	private highlightedInTreeView: CodeMapBuilding
	private intersectedBuilding: CodeMapBuilding

	private mouse: Coordinates = { x: 0, y: 0 }
	private oldMouse: Coordinates = { x: 0, y: 0 }
	private mouseOnLastClick: Coordinates = { x: 0, y: 0 }

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private $window: IWindowService,
		private threeCameraService: ThreeCameraService,
		private threeRendererService: ThreeRendererService,
		private threeSceneService: ThreeSceneService,
		private threeUpdateCycleService: ThreeUpdateCycleService,
		private storeService: StoreService
	) {
		this.threeUpdateCycleService.register(() => this.updateHovering())
		MapTreeViewLevelController.subscribeToHoverEvents(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
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
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		const selectedBuilding = this.threeSceneService.getSelectedBuilding()
		if (selectedBuilding) {
			const isSelectedBuildingBlacklisted = CodeMapHelper.isPathHiddenOrExcluded(selectedBuilding.node.path, blacklist)

			if (isSelectedBuildingBlacklisted) {
				this.threeSceneService.clearSelection()
			}
		}
		this.unhoverBuilding()
	}

	updateHovering() {
		if (this.hasMouseMoved(this.oldMouse)) {
			this.oldMouse.x = this.mouse.x
			this.oldMouse.y = this.mouse.y

			this.threeCameraService.camera.updateMatrixWorld(false)

			if (this.threeSceneService.getMapMesh()) {
				this.intersectedBuilding = this.threeSceneService
					.getMapMesh()
					.checkMouseRayMeshIntersection(this.transformHTMLToSceneCoordinates(), this.threeCameraService.camera)
				const from = this.threeSceneService.getHighlightedBuilding()
				const to = this.intersectedBuilding ? this.intersectedBuilding : this.highlightedInTreeView

				if (this.intersectedBuilding !== undefined) {
					CodeMapMouseEventService.changeCursorIndicator(CursorType.Pointer)
				}

				if (from !== to) {
					this.unhoverBuilding()
					if (to) {
						this.hoverBuilding(to)
					}
				}
			}
		}
	}

	onDocumentMouseMove(event: MouseEvent) {
		this.mouse.x = event.clientX
		this.mouse.y = event.clientY
	}

	onDocumentDoubleClick() {
		const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()
		// check if mouse moved to prevent opening the building link after rotating the map, when the cursor ends on a building
		if (highlightedBuilding && !this.hasMouseMoved(this.mouseOnLastClick)) {
			const fileSourceLink = highlightedBuilding.node.link
			if (fileSourceLink) {
				this.$window.open(fileSourceLink, "_blank")
			}
		}
	}

	onDocumentMouseDown(event: MouseEvent) {
		if (event.button === ClickType.RightClick) {
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Moving)
			NodeContextMenuController.broadcastHideEvent(this.$rootScope)
		}
		if (event.button === ClickType.LeftClick) {
			CodeMapMouseEventService.changeCursorIndicator(CursorType.Grabbing)
		}
		this.mouseOnLastClick = { x: event.clientX, y: event.clientY }
		$(document.activeElement).blur()
	}

	onDocumentMouseUp(event: MouseEvent) {
		if (event.button === ClickType.LeftClick) {
			this.onLeftClick()
		} else {
			this.onRightClick()
		}
		CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
	}

	private onRightClick() {
		const building = this.threeSceneService.getHighlightedBuilding()
		// check if mouse moved to prevent the node context menu to show up after moving the map, when the cursor ends on a building
		if (building && !this.hasMouseMoved(this.mouseOnLastClick)) {
			this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_RIGHT_CLICKED_EVENT, {
				building,
				x: this.mouse.x,
				y: this.mouse.y
			})
		}
	}

	private onLeftClick() {
		this.threeSceneService.clearSelection()
		if (this.intersectedBuilding && !this.hasMouseMoved(this.mouseOnLastClick)) {
			this.threeSceneService.selectBuilding(this.intersectedBuilding)
		}
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
		const rect = this.threeRendererService.renderer.domElement.getBoundingClientRect()
		const x = (this.mouse.x / this.threeRendererService.renderer.domElement.width) * 2 - 1
		const y = -((this.mouse.y - rect.top) / this.threeRendererService.renderer.domElement.height) * 2 + 1
		return { x, y }
	}

	private hoverBuildingAndChildren(hoveredBuilding: CodeMapBuilding) {
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

	private unhoverBuilding() {
		CodeMapMouseEventService.changeCursorIndicator(CursorType.Default)
		this.threeSceneService.clearHighlight()
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_UNHOVERED_EVENT)
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
}
