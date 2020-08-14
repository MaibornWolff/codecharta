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
import { hierarchy } from "d3"

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

	public start() {
		this.threeRendererService.renderer.domElement.addEventListener("mousemove", () => this.onDocumentMouseMove(event))
		this.threeRendererService.renderer.domElement.addEventListener("mouseup", () => this.onDocumentMouseUp(event))
		this.threeRendererService.renderer.domElement.addEventListener("mousedown", () => this.onDocumentMouseDown(event))
		this.threeRendererService.renderer.domElement.addEventListener("dblclick", () => this.onDocumentDoubleClick())
		ViewCubeMouseEventsService.subscribeToEventPropagation(this.$rootScope, this)
	}

	public onShouldHoverNode(node: CodeMapNode) {
		const buildings: CodeMapBuilding[] = this.threeSceneService.getMapMesh().getMeshDescription().buildings
		buildings.forEach(building => {
			if (building.node.path === node.path) {
				this.hoverBuilding(building)
				this.highlightedInTreeView = building
			}
		})
	}

	public onShouldUnhoverNode() {
		this.unhoverBuilding()
		this.highlightedInTreeView = null
	}

	public onViewCubeEventPropagation(eventType: string, event: MouseEvent) {
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

	public onFilesSelectionChanged() {
		this.threeSceneService.clearSelection()
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		const selectedBuilding = this.threeSceneService.getSelectedBuilding()
		if (selectedBuilding) {
			const isSelectedBuildingBlacklisted = CodeMapHelper.isPathHiddenOrExcluded(selectedBuilding.node.path, blacklist)

			if (isSelectedBuildingBlacklisted) {
				this.threeSceneService.clearSelection()
			}
		}
		this.unhoverBuilding()
	}

	public updateHovering() {
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

				if (from !== to) {
					this.unhoverBuilding()
					if (to) {
						this.hoverBuilding(to)
					}
				}
			}
		}
	}

	public onDocumentMouseMove(event) {
		this.mouse.x = event.clientX
		this.mouse.y = event.clientY
	}

	public onDocumentDoubleClick() {
		const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()
		if (highlightedBuilding) {
			const fileSourceLink = highlightedBuilding.node.link
			if (fileSourceLink) {
				this.$window.open(fileSourceLink, "_blank")
			}
		}
	}

	public onDocumentMouseDown(event) {
		this.mouseOnLastClick = { x: event.clientX, y: event.clientY }
		$(document.activeElement).blur()
	}

	public onDocumentMouseUp(event) {
		if (event.button === ClickType.LeftClick) {
			this.onLeftClick()
		} else {
			this.onRightClick()
		}
	}

	private onRightClick() {
		const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()

		if (highlightedBuilding && !this.hasMouseMoved(this.mouseOnLastClick)) {
			this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_RIGHT_CLICKED_EVENT, {
				building: highlightedBuilding,
				x: this.mouse.x,
				y: this.mouse.y
			})
		}
	}

	private onLeftClick() {
		this.threeSceneService.clearSelection()
		if (this.intersectedBuilding) {
			this.threeSceneService.selectBuilding(this.intersectedBuilding)
		}
	}

	private hasMouseMoved(mouse: Coordinates): boolean {
		return this.mouse.x !== mouse.x || this.mouse.y !== mouse.y
	}

	private hoverBuilding(hoveredBuilding: CodeMapBuilding) {
		if (hoveredBuilding) {
			this.hoverBuildingAndChildren(hoveredBuilding)
		}
	}

	private transformHTMLToSceneCoordinates(): Coordinates {
		const topOffset = $(this.threeRendererService.renderer.domElement).offset().top - $(window).scrollTop()
		const x = (this.mouse.x / this.threeRendererService.renderer.domElement.width) * 2 - 1
		const y = -((this.mouse.y - topOffset) / this.threeRendererService.renderer.domElement.height) * 2 + 1
		return { x, y }
	}

	private hoverBuildingAndChildren(hoveredBuilding: CodeMapBuilding) {
		const lookUp = this.storeService.getState().lookUp
		const codeMapNode = lookUp.idToNode.get(hoveredBuilding.node.id)
		hierarchy(codeMapNode).each(x => {
			const building = lookUp.idToBuilding.get(x.data.id)
			if (building) {
				this.threeSceneService.addBuildingToHighlightingList(building)
			}
		})
		this.threeSceneService.highlightBuildings()
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_HOVERED_EVENT, { hoveredBuilding })
	}

	private unhoverBuilding() {
		this.threeSceneService.clearHighlight()
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_UNHOVERED_EVENT)
	}

	public static subscribeToBuildingHovered($rootScope: IRootScopeService, subscriber: BuildingHoveredSubscriber) {
		$rootScope.$on(this.BUILDING_HOVERED_EVENT, (_event, data) => {
			subscriber.onBuildingHovered(data.hoveredBuilding)
		})
	}

	public static subscribeToBuildingUnhovered($rootScope: IRootScopeService, subscriber: BuildingUnhoveredSubscriber) {
		$rootScope.$on(this.BUILDING_UNHOVERED_EVENT, () => {
			subscriber.onBuildingUnhovered()
		})
	}

	public static subscribeToBuildingRightClickedEvents($rootScope: IRootScopeService, subscriber: BuildingRightClickedEventSubscriber) {
		$rootScope.$on(this.BUILDING_RIGHT_CLICKED_EVENT, (_event, data) => {
			subscriber.onBuildingRightClicked(data.building, data.x, data.y)
		})
	}
}
