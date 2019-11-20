import { MapTreeViewHoverEventSubscriber, MapTreeViewLevelController } from "../mapTreeView/mapTreeView.level.component"
import { ThreeCameraService } from "./threeViewer/threeCameraService"
import { IRootScopeService, IWindowService } from "angular"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import $ from "jquery"
import { ViewCubeEventPropagationSubscriber, ViewCubeMouseEventsService } from "../viewCube/viewCube.mouseEvents.service"
import { CodeMapNode, FileState, BlacklistItem } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { ThreeRendererService } from "./threeViewer/threeRendererService"
import { FileStateServiceSubscriber, FileStateService } from "../../state/fileState.service"
import { BlacklistSubscriber } from "../../state/settingsService/settings.service.events"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { StoreService } from "../../state/store.service"

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
	ClickAndMove,
	LeftClick,
	RightClick
}

export class CodeMapMouseEventService
	implements MapTreeViewHoverEventSubscriber, ViewCubeEventPropagationSubscriber, FileStateServiceSubscriber, BlacklistSubscriber {
	private static readonly BUILDING_HOVERED_EVENT = "building-hovered"
	private static readonly BUILDING_UNHOVERED_EVENT = "building-unhovered"
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
		this.threeUpdateCycleService.register(() => this.updateHovering())
		MapTreeViewLevelController.subscribeToHoverEvents($rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
		StoreService.subscribeToBlacklist(this.$rootScope, this)
	}

	public start() {
		this.threeRendererService.renderer.domElement.addEventListener("mousemove", () => this.onDocumentMouseMove(event))
		this.threeRendererService.renderer.domElement.addEventListener("mouseup", () => this.onDocumentMouseUp())
		this.threeRendererService.renderer.domElement.addEventListener("mousedown", () => this.onDocumentMouseDown(event))
		this.threeRendererService.renderer.domElement.addEventListener("dblclick", () => this.onDocumentDoubleClick(event))
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
					if (to) {
						this.hoverBuilding(to)
					} else {
						this.unhoverBuilding()
					}
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
				this.threeSceneService.clearSelection()
				this.threeSceneService.selectBuilding(highlightedBuilding)
			} else {
				this.threeSceneService.clearSelection()
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

	private hoverBuilding(hoveredBuilding: CodeMapBuilding) {
		/*
         if the hovered node does not have useful data, then we should look at its parent. If the parent has useful data
         then this parent is a delta node which is made of two seperate, data-free nodes. This quick fix helps us to
         handle delta objects, until there is a method for mergng their meshes and materials correctly.
         See codeMapRenderService.js
         */
		if (hoveredBuilding && !hoveredBuilding.node) {
			if (hoveredBuilding.parent && hoveredBuilding.parent.node) {
				hoveredBuilding.setNode(hoveredBuilding.parent.node)
			}
		}

		if (hoveredBuilding) {
			this.threeSceneService.highlightBuilding(hoveredBuilding)
			this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_HOVERED_EVENT, { hoveredBuilding: hoveredBuilding })
		}
	}

	private unhoverBuilding() {
		this.threeSceneService.clearHighlight()
		this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_UNHOVERED_EVENT)
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

	public onShouldUnhoverNode(node: CodeMapNode) {
		this.unhoverBuilding()
		this.highlightedInTreeView = null
	}

	public static subscribeToBuildingHovered($rootScope: IRootScopeService, subscriber: BuildingHoveredSubscriber) {
		$rootScope.$on(this.BUILDING_HOVERED_EVENT, (e, data) => {
			subscriber.onBuildingHovered(data.hoveredBuilding)
		})
	}

	public static subscribeToBuildingUnhovered($rootScope: IRootScopeService, subscriber: BuildingUnhoveredSubscriber) {
		$rootScope.$on(this.BUILDING_UNHOVERED_EVENT, e => {
			subscriber.onBuildingUnhovered()
		})
	}

	public static subscribeToBuildingRightClickedEvents($rootScope: IRootScopeService, subscriber: BuildingRightClickedEventSubscriber) {
		$rootScope.$on(this.BUILDING_RIGHT_CLICKED_EVENT, (e, data) => {
			subscriber.onBuildingRightClicked(data.building, data.x, data.y)
		})
	}
}
