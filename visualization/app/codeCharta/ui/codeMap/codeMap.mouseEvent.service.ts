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
import { Box3, Object3D, Raycaster, Vector3 } from "three"

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
	private mapLabelColors = this.storeService.getState().appSettings.mapColors.labelColorAndAlpha

	private highlightedInTreeView: CodeMapBuilding
	private intersectedBuilding: CodeMapBuilding

	private mouse: Coordinates = { x: 0, y: 0 }
	private oldMouse: Coordinates = { x: 0, y: 0 }
	private mouseOnLastClick: Coordinates = { x: 0, y: 0 }
	private isGrabbing = false
	private isMoving = false
	private raycaster = new Raycaster()
	private normedTransformVector = new Vector3(0, 0, 0)
	private modifiedLabel = null
	private rayPoint = new Vector3(0, 0, 0)

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
		this.modifiedLabel = null
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

	updateHovering() {
		if (this.hasMouseMoved(this.oldMouse)) {
			this.oldMouse.x = this.mouse.x
			this.oldMouse.y = this.mouse.y

			// reset label to original position
			if (this.modifiedLabel !== null) {
				this.modifiedLabel["object"]["position"]["x"] = this.modifiedLabel["object"]["position"]["x"] - this.normedTransformVector.x
				this.modifiedLabel["object"]["position"]["y"] = this.modifiedLabel["object"]["position"]["y"] - this.normedTransformVector.y
				this.modifiedLabel["object"]["position"]["z"] = this.modifiedLabel["object"]["position"]["z"] - this.normedTransformVector.z
				this.modifiedLabel["object"]["material"]["opacity"] = this.mapLabelColors.alpha
				this.modifiedLabel = null
			}

			const mouseCoordinates = this.transformHTMLToSceneCoordinates()
			const camera = this.threeCameraService.camera
			const labels = this.threeSceneService.labels ? this.threeSceneService.labels.children : null

			const mapMesh = this.threeSceneService.getMapMesh()
			let nodeNameHoveredLabel = ""

			this.threeCameraService.camera.updateMatrixWorld(false)

			if (mapMesh) {
				this.raycaster.setFromCamera(mouseCoordinates, camera)

				const hoveredLabel = this.calculateHoveredLabel(labels)

				if (hoveredLabel) {
					nodeNameHoveredLabel = hoveredLabel.object.userData.node.path
					hoveredLabel.object.material.opacity = 1

					this.rayPoint = new Vector3(
						this.raycaster["ray"]["origin"]["x"] - hoveredLabel["object"]["position"]["x"],
						this.raycaster["ray"]["origin"]["y"] - hoveredLabel["object"]["position"]["y"],
						this.raycaster["ray"]["origin"]["z"] - hoveredLabel["object"]["position"]["z"]
					)

					const norm = Math.sqrt(Math.pow(this.rayPoint.x, 2) + Math.pow(this.rayPoint.y, 2) + Math.pow(this.rayPoint.z, 2))
					let maxDistance = 0
					const cameraPoint = this.raycaster.ray.origin

					for (let counter = 0; counter < labels.length; counter += 2) {
						const bboxHoveredLabel = new Box3().setFromObject(hoveredLabel.object)
						const centerPoint = new Vector3()
						bboxHoveredLabel.getCenter(centerPoint)
						const distanceLabelCenterToCamera = cameraPoint.distanceTo(centerPoint)
						let maxDistanceForLabel = distanceLabelCenterToCamera / 20 //creates a nice small highlighting for hovered, unobstructed labels, empirically gathered value

						if (labels[counter] !== hoveredLabel.object) {
							const bboxObstructingLabel = new Box3().setFromObject(labels[counter])
							const centerPoint2 = new Vector3()

							bboxObstructingLabel.getCenter(centerPoint2)

							maxDistanceForLabel = Math.max(
								this.getIntersectionDistance(
									bboxHoveredLabel,
									bboxObstructingLabel,
									new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm),
									distanceLabelCenterToCamera - cameraPoint.distanceTo(centerPoint2)
								),
								this.getIntersectionDistance(
									bboxHoveredLabel,
									bboxObstructingLabel,
									new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm),
									distanceLabelCenterToCamera - cameraPoint.distanceTo(bboxObstructingLabel.max)
								),
								this.getIntersectionDistance(
									bboxHoveredLabel,
									bboxObstructingLabel,
									new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm),
									distanceLabelCenterToCamera - cameraPoint.distanceTo(bboxObstructingLabel.min)
								)
							)
						}
						maxDistance = Math.max(maxDistance, maxDistanceForLabel)
					}

					this.normedTransformVector = new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm)
					this.normedTransformVector.multiplyScalar(maxDistance)

					hoveredLabel["object"]["position"]["x"] = hoveredLabel["object"]["position"]["x"] + this.normedTransformVector.x
					hoveredLabel["object"]["position"]["y"] = hoveredLabel["object"]["position"]["y"] + this.normedTransformVector.y
					hoveredLabel["object"]["position"]["z"] = hoveredLabel["object"]["position"]["z"] + this.normedTransformVector.z

					this.modifiedLabel = hoveredLabel
				}

				this.intersectedBuilding =
					nodeNameHoveredLabel !== ""
						? mapMesh.getBuildingByPath(nodeNameHoveredLabel)
						: mapMesh.checkMouseRayMeshIntersection(mouseCoordinates, camera)

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

	private isOverlapping1D(minBox1: number, maxBox1: number, minBox2: number, maxBox2: number) {
		return maxBox1 >= minBox2 && maxBox2 >= minBox1
	}

	private getIntersectionDistance(bboxHoveredLabel: Box3, bboxObstructingLabel: Box3, normedVector: Vector3, distance: number) {
		normedVector.multiplyScalar(distance)
		bboxHoveredLabel.translate(normedVector)

		if (
			this.isOverlapping1D(bboxObstructingLabel.min.x, bboxObstructingLabel.max.x, bboxHoveredLabel.min.x, bboxHoveredLabel.max.x) &&
			this.isOverlapping1D(bboxObstructingLabel.min.y, bboxObstructingLabel.max.y, bboxHoveredLabel.min.y, bboxHoveredLabel.max.y)
		) {
			return distance
		}
		return 0
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

		if (labels !== null) {
			for (let counter = 0; counter < labels.length; counter += 2) {
				const intersect = this.raycaster.intersectObject(this.threeSceneService.labels.children[counter])
				if (intersect.length > 0) {
					if (labelClosestToViewPoint === null) {
						labelClosestToViewPoint = intersect[0]
					} else {
						labelClosestToViewPoint =
							labelClosestToViewPoint["distance"] < intersect[0]["distance"] ? labelClosestToViewPoint : intersect[0]
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
		if (building && !this.hasMouseMoved(this.mouseOnLastClick)) {
			this.$rootScope.$broadcast(CodeMapMouseEventService.BUILDING_RIGHT_CLICKED_EVENT, {
				building,
				x: this.mouse.x,
				y: this.mouse.y
			})
			this.hoverBuilding(building)
		}
	}

	private onLeftClick() {
		this.threeSceneService.clearSelection()
		this.isGrabbing = false
		if (!this.hasMouseMoved(this.mouseOnLastClick)) {
			this.threeSceneService.clearConstantHighlight()
			if (this.intersectedBuilding) {
				this.threeSceneService.selectBuilding(this.intersectedBuilding)
			}
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
