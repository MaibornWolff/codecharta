import { MapTreeViewHoverEventSubscriber, MapTreeViewLevelController } from "../mapTreeView/mapTreeView.level.component"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { IAngularEvent, IRootScopeService, IWindowService } from "angular"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import $ from "jquery"
import { ViewCubeEventPropagationSubscriber, ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapNode, FileState } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"

interface Coordinates {
	x: number
	y: number
}

export interface CodeMapBuildingTransition {
	from: CodeMapBuilding
	to: CodeMapBuilding
}

export interface BuildingHoveredEventSubscriber {
	onBuildingHovered(data: CodeMapBuildingTransition, event: IAngularEvent)
}

export interface BuildingSelectedEventSubscriber {
	onBuildingSelected(data: CodeMapBuildingTransition, event: IAngularEvent)
}

export interface BuildingRightClickedEventSubscriber {
	onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: IAngularEvent)
}

export class CodeMapMouseEventService
	implements MapTreeViewHoverEventSubscriber, ViewCubeEventPropagationSubscriber, FileStateServiceSubscriber {
	private static readonly BUILDING_HOVERED_EVENT = "building-hovered"
	private static readonly BUILDING_SELECTED_EVENT = "building-selected"
	private static readonly BUILDING_RIGHT_CLICKED_EVENT = "building-right-clicked"

	private hoveredInCodeMap: CodeMapBuilding = null
	private hoveredInTreeView: CodeMapBuilding = null
	private selected: CodeMapBuilding = null
	private mouse: Coordinates = { x: 0, y: 0 }
	private dragOrClickFlag = 0

	/* @ngInject */
	constructor(
		private $rootScope: IRootScopeService,
		private $window: IWindowService,
		private threeCameraService: ThreeCameraService,
		private threeRendererService: ThreeRendererService,
		private threeSceneService: ThreeSceneService,
		private threeUpdateCycleService: ThreeUpdateCycleService
	) {
		this.threeUpdateCycleService.register(this.update.bind(this))
		MapTreeViewLevelController.subscribeToHoverEvents($rootScope, this)
		FileStateService.subscribe($rootScope, this)
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

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.hoveredInCodeMap = null
		this.selected = null
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {}

	public update() {
		this.threeCameraService.camera.updateMatrixWorld(false)

		if (this.threeSceneService.getMapMesh()) {
			const intersectionResult = this.threeSceneService
				.getMapMesh()
				.checkMouseRayMeshIntersection(this.mouse, this.threeCameraService.camera)

			if (intersectionResult.intersectionFound) {
				const to = intersectionResult.building

				if (this.hoveredInCodeMap !== to) {
					this.onBuildingHovered(this.hoveredInCodeMap, to)
				}
			} else if (this.hoveredInCodeMap && !this.hoveredInTreeView) {
				this.onBuildingHovered(this.hoveredInCodeMap, null)
			}
		}
	}

	public onDocumentMouseMove(event) {
		const topOffset = $(this.threeRendererService.renderer.domElement).offset().top - $(window).scrollTop()
		this.mouse.x = (event.clientX / this.threeRendererService.renderer.domElement.width) * 2 - 1
		this.mouse.y = -((event.clientY - topOffset) / this.threeRendererService.renderer.domElement.height) * 2 + 1
		this.dragOrClickFlag = 1
	}

	public onDocumentMouseUp() {
		if (this.dragOrClickFlag === 0) {
			if (this.hoveredInCodeMap) {
				this.onBuildingSelected(null, this.hoveredInCodeMap)
			}

			if (!this.hoveredInCodeMap && this.selected) {
				this.selected = null
				this.onBuildingSelected(null, null)
			}
		}
	}

	public onDocumentMouseDown(event) {
		if (event.button === 0) {
			this.onLeftClick(event)
		} else if (event.button === 2) {
			this.onRightClick(event)
		}
	}

	public onRightClick(event) {
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_RIGHT_CLICKED_EVENT, {
			building: this.hoveredInCodeMap,
			x: event.clientX,
			y: event.clientY,
			event: event
		})
	}

	public onLeftClick(event) {
		this.dragOrClickFlag = 0
	}

	public onDocumentDoubleClick(event) {
		if (!this.hoveredInCodeMap) {
			return
		}
		let fileSourceLink = this.hoveredInCodeMap.node.link

		if (fileSourceLink) {
			this.$window.open(fileSourceLink, "_blank")
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
			this.hoveredInCodeMap = to
		} else {
			this.threeSceneService.clearHighlight()
			this.hoveredInCodeMap = null
		}
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_HOVERED_EVENT, { to: to, from: from })
	}

	public onBuildingSelected(from: CodeMapBuilding, to: CodeMapBuilding) {
		if (to) {
			if (this.selected) {
				this.threeSceneService.clearSelection()
			}
			this.threeSceneService.selectBuilding(to)
			this.selected = to
		} else {
			this.threeSceneService.clearSelection()
			this.selected = null
		}
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_SELECTED_EVENT, { to: to, from: from })
	}

	public onShouldHoverNode(node: CodeMapNode) {
		const buildings: CodeMapBuilding[] = this.threeSceneService.getMapMesh().getMeshDescription().buildings
		buildings.forEach(building => {
			if (building.node.path === node.path) {
				this.onBuildingHovered(this.hoveredInCodeMap, building)
				this.hoveredInTreeView = building
			}
		})
	}

	public onShouldUnhoverNode(node: CodeMapNode) {
		this.onBuildingHovered(this.hoveredInCodeMap, null)
		this.hoveredInTreeView = null
	}

	public static subscribeToBuildingHoveredEvents($rootScope: IRootScopeService, subscriber: BuildingHoveredEventSubscriber) {
		$rootScope.$on(this.BUILDING_HOVERED_EVENT, (e, data: CodeMapBuildingTransition) => {
			subscriber.onBuildingHovered(data, e)
		})
	}

	public static subscribeToBuildingSelectedEvents($rootScope: IRootScopeService, subscriber: BuildingSelectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_SELECTED_EVENT, (e, data: CodeMapBuildingTransition) => {
			subscriber.onBuildingSelected(data, e)
		})
	}

	public static subscribeToBuildingRightClickedEvents($rootScope: IRootScopeService, subscriber: BuildingRightClickedEventSubscriber) {
		$rootScope.$on(this.BUILDING_RIGHT_CLICKED_EVENT, (e, data) => {
			subscriber.onBuildingRightClicked(data.building, data.x, data.y, e)
		})
	}
}
