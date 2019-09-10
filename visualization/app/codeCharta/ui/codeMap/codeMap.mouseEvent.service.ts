import { MapTreeViewHoverEventSubscriber, MapTreeViewLevelController } from "../mapTreeView/mapTreeView.level.component"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { IRootScopeService, IWindowService } from "angular"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import $ from "jquery"
import { ViewCubeEventPropagationSubscriber, ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapNode, FileState } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { FileStateServiceSubscriber, FileStateService } from "../../state/fileState.service"

interface Coordinates {
	x: number
	y: number
}

export interface CodeMapBuildingTransition {
	from: CodeMapBuilding
	to: CodeMapBuilding
}

export interface BuildingHoveredEventSubscriber {
	onBuildingHovered(data: CodeMapBuildingTransition)
}

export interface BuildingSelectedEventSubscriber {
	onBuildingSelected(selectedBuilding: CodeMapBuilding)
}

export interface BuildingDeselectedEventSubscriber {
	onBuildingDeselected()
}

export interface BuildingRightClickedEventSubscriber {
	onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number)
}

export enum ClickType {
	ClickAndMove,
	LeftClick,
	RightClick
}

export class CodeMapMouseEventService
	implements MapTreeViewHoverEventSubscriber, ViewCubeEventPropagationSubscriber, FileStateServiceSubscriber {
	private static readonly BUILDING_HOVERED_EVENT = "building-hovered"
	private static readonly BUILDING_SELECTED_EVENT = "building-selected"
	private static readonly BUILDING_DESELECTED_EVENT = "building-deselected"
	private static readonly BUILDING_RIGHT_CLICKED_EVENT = "building-right-clicked"

	private highlightedInTreeView: CodeMapBuilding = null

	private mouse: Coordinates = { x: 0, y: 0 }
	private oldMouse: Coordinates = { x: 0, y: 0 }
	private clickType: ClickType = null

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private $window: IWindowService,
		private threeCameraService: ThreeCameraService,
		private threeRendererService: ThreeRendererService,
		private threeSceneService: ThreeSceneService,
		private threeUpdateCycleService: ThreeUpdateCycleService
	) {
		this.threeUpdateCycleService.register(this.updateHovering.bind(this))
		MapTreeViewLevelController.subscribeToHoverEvents($rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public start() {
		this.threeRendererService.renderer.domElement.addEventListener("mousemove", this.onDocumentMouseMove.bind(this), false)
		this.threeRendererService.renderer.domElement.addEventListener("mouseup", this.onDocumentMouseUp.bind(this), false)
		this.threeRendererService.renderer.domElement.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false)
		this.threeRendererService.renderer.domElement.addEventListener("dblclick", this.onDocumentDoubleClick.bind(this), false)
		ViewCubeMouseEventsService.subscribeToEventPropagation(this.$rootScope, this)
	}

	public onViewCubeEventPropagation(eventType: string, event: MouseEvent) {
		switch (eventType) {
			case "mousemove":
				this.onDocumentMouseMove(event)
				break
			case "mouseup":
				this.onDocumentMouseUp()
				break
			case "mousedown":
				this.onDocumentMouseDown(event)
				break
			case "dblclick":
				this.onDocumentDoubleClick(event)
				break
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.onBuildingDeselected()
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public updateHovering() {
		if (this.hasMouseMoved()) {
			this.oldMouse.x = this.mouse.x
			this.oldMouse.y = this.mouse.y

			this.threeCameraService.camera.updateMatrixWorld(false)

			if (this.threeSceneService.getMapMesh()) {
				let intersectionResult = this.threeSceneService
					.getMapMesh()
					.checkMouseRayMeshIntersection(this.mouse, this.threeCameraService.camera)

				const from = this.threeSceneService.getHighlightedBuilding()
				let to = null

				if (intersectionResult.intersectionFound) {
					to = intersectionResult.building
				} else {
					to = this.highlightedInTreeView
				}

				if (from !== to) {
					this.onBuildingHovered(from, to)
				}
			}
		}
	}

	private hasMouseMoved(): boolean {
		return this.mouse.x !== this.oldMouse.x || this.mouse.y !== this.oldMouse.y
	}

	public onDocumentMouseMove(event) {
		const topOffset = $(this.threeRendererService.renderer.domElement).offset().top - $(window).scrollTop()
		this.mouse.x = (event.clientX / this.threeRendererService.renderer.domElement.width) * 2 - 1
		this.mouse.y = -((event.clientY - topOffset) / this.threeRendererService.renderer.domElement.height) * 2 + 1
		this.clickType = ClickType.ClickAndMove
	}

	public onDocumentMouseUp() {
		if (this.clickType === ClickType.LeftClick) {
			const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()
			if (highlightedBuilding) {
				this.onBuildingSelected(highlightedBuilding)
			} else {
				this.onBuildingDeselected()
			}
		}
	}

	public onDocumentMouseDown(event) {
		if (event.button === 0) {
			this.onLeftClick()
		} else if (event.button === 2) {
			this.onRightClick(event)
		}
	}

	public onLeftClick() {
		this.clickType = ClickType.LeftClick
	}

	public onRightClick(event) {
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_RIGHT_CLICKED_EVENT, {
			building: this.threeSceneService.getHighlightedBuilding(),
			x: event.clientX,
			y: event.clientY,
			event: event
		})
	}

	public onDocumentDoubleClick(event) {
		const highlightedBuilding = this.threeSceneService.getHighlightedBuilding()
		if (highlightedBuilding) {
			let fileSourceLink = highlightedBuilding.node.link
			if (fileSourceLink) {
				this.$window.open(fileSourceLink, "_blank")
			}
		}
	}

	public onBuildingHovered(from: CodeMapBuilding, to: CodeMapBuilding) {
		/*
         if the hovered node does not have useful data, then we should look at its parent. If the parent has useful data
         then this parent is a delta node which is made of two seperate, data-free nodes. This quick fix helps us to
         handle delta objects, until there is a method for mergng their meshes and materials correctly.
         See codeMapRenderService.js
         */
		if (to && !to.node) {
			if (to.parent && to.parent.node) {
				to.setNode(to.parent.node)
			}
		}

		if (to) {
			this.threeSceneService.highlightBuilding(to)
		} else {
			this.threeSceneService.clearHighlight()
		}
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_HOVERED_EVENT, { to: to, from: from })
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		this.threeSceneService.clearSelection()
		this.threeSceneService.selectBuilding(selectedBuilding)
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_SELECTED_EVENT, selectedBuilding)
	}

	public onBuildingDeselected() {
		this.threeSceneService.clearSelection()
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_DESELECTED_EVENT)
	}

	public onShouldHoverNode(node: CodeMapNode) {
		const buildings: CodeMapBuilding[] = this.threeSceneService.getMapMesh().getMeshDescription().buildings
		buildings.forEach(building => {
			if (building.node.path === node.path) {
				this.onBuildingHovered(this.threeSceneService.getHighlightedBuilding(), building)
				this.highlightedInTreeView = building
			}
		})
	}

	public onShouldUnhoverNode(node: CodeMapNode) {
		this.onBuildingHovered(this.highlightedInTreeView, null)
		this.highlightedInTreeView = null
	}

	public static subscribeToBuildingHoveredEvents($rootScope: IRootScopeService, subscriber: BuildingHoveredEventSubscriber) {
		$rootScope.$on(this.BUILDING_HOVERED_EVENT, (e, data: CodeMapBuildingTransition) => {
			subscriber.onBuildingHovered(data)
		})
	}

	public static subscribeToBuildingSelectedEvents($rootScope: IRootScopeService, subscriber: BuildingSelectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_SELECTED_EVENT, (e, selectedBuilding: CodeMapBuilding) => {
			subscriber.onBuildingSelected(selectedBuilding)
		})
	}

	public static subscribeToBuildingDeselectedEvents($rootScope: IRootScopeService, subscriber: BuildingDeselectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_DESELECTED_EVENT, e => {
			subscriber.onBuildingDeselected()
		})
	}

	public static subscribeToBuildingRightClickedEvents($rootScope: IRootScopeService, subscriber: BuildingRightClickedEventSubscriber) {
		$rootScope.$on(this.BUILDING_RIGHT_CLICKED_EVENT, (e, data) => {
			subscriber.onBuildingRightClicked(data.building, data.x, data.y)
		})
	}
}
