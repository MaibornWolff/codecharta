import { AmbientLight, DirectionalLight, Scene, Group, Material, Raycaster, Vector3, Object3D, Box3 } from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { CodeMapPreRenderServiceSubscriber, CodeMapPreRenderService } from "../codeMap.preRender.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { CodeMapNode } from "../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { ColorConverter } from "../../../util/color/colorConverter"

export interface BuildingSelectedEventSubscriber {
	onBuildingSelected(selectedBuilding?: CodeMapBuilding)
}

export interface BuildingDeselectedEventSubscriber {
	onBuildingDeselected()
}

export interface CodeMapMeshChangedSubscriber {
	onCodeMapMeshChanged(mapMesh: CodeMapMesh)
}

export class ThreeSceneService implements CodeMapPreRenderServiceSubscriber {
	private static readonly BUILDING_SELECTED_EVENT = "building-selected"
	private static readonly BUILDING_DESELECTED_EVENT = "building-deselected"
	private static readonly CODE_MAP_MESH_CHANGED_EVENT = "code-map-mesh-changed"

	scene: Scene
	labels: Group
	edgeArrows: Group
	mapGeometry: Group
	private readonly lights: Group
	private mapMesh: CodeMapMesh

	private selected: CodeMapBuilding = null
	private highlighted: CodeMapBuilding[] = []
	private constantHighlight: Map<number, CodeMapBuilding> = new Map()

	private folderLabelColorHighlighted = ColorConverter.convertHexToNumber("#FFFFFF")
	private folderLabelColorNotHighlighted = ColorConverter.convertHexToNumber("#7A7777")
	private folderLabelColorSelected = this.storeService.getState().appSettings.mapColors.selected
	private numberOrangeColor = ColorConverter.convertHexToNumber(this.folderLabelColorSelected)
	private rayPoint = new Vector3(0, 0, 0)
	private normedTransformVector = new Vector3(0, 0, 0)
	private modifiedLabel = null
	private mapLabelColors = this.storeService.getState().appSettings.mapColors.labelColorAndAlpha

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		CodeMapPreRenderService.subscribe(this.$rootScope, this)

		this.scene = new Scene()
		this.mapGeometry = new Group()
		this.lights = new Group()
		this.labels = new Group()
		this.edgeArrows = new Group()

		this.initLights()

		this.scene.add(this.mapGeometry)
		this.scene.add(this.edgeArrows)
		this.scene.add(this.labels)
		this.scene.add(this.lights)
	}

	onRenderMapChanged() {
		this.reselectBuilding()
	}

	getConstantHighlight() {
		return this.constantHighlight
	}

	highlightBuildings() {
		const state = this.storeService.getState()
		this.getMapMesh().highlightBuilding(this.highlighted, this.selected, state, this.constantHighlight)
		if (this.mapGeometry.children[0]) {
			this.highlightMaterial(this.mapGeometry.children[0]["material"])
		}
	}

	highlightBuildingsAfterSelect() {
		// TODO dead code? Remove it please.
		const state = this.storeService.getState()
		this.getMapMesh().highlightBuilding(this.highlighted, this.selected, state, this.constantHighlight)
	}

	private selectMaterial(materials: Material[]) {
		const selectedMaterial = materials.find(({ userData }) => userData.id === this.selected.node.id)
		selectedMaterial?.["color"].setHex(this.numberOrangeColor)
	}

	private resetMaterial(materials: Material[]) {
		const selectedID = this.selected ? this.selected.node.id : -1
		for (const material of materials) {
			const materialNodeId = material.userData.id
			if (materialNodeId !== selectedID) {
				material["color"]?.setHex(this.folderLabelColorHighlighted)
			}
		}
	}

	scaleHeight() {
		const { mapSize } = this.storeService.getState().treeMap
		const scale = this.storeService.getState().appSettings.scaling

		this.mapGeometry.scale.set(scale.x, scale.y, scale.z)
		this.mapGeometry.position.set(-mapSize * scale.x, 0, -mapSize * scale.z)
		this.mapMesh.setScale(scale)
	}

	private highlightMaterial(materials: Material[]) {
		const highlightedNodeIds = new Set(this.highlighted.map(({ node }) => node.id))
		const constantHighlightedNodes = new Set<number>()

		for (const { node } of this.constantHighlight.values()) {
			constantHighlightedNodes.add(node.id)
		}

		for (const material of materials) {
			const materialNodeId = material.userData.id
			if (this.selected && materialNodeId === this.selected.node.id) {
				material["color"].setHex(this.numberOrangeColor)
			} else if (highlightedNodeIds.has(materialNodeId) || constantHighlightedNodes.has(materialNodeId)) {
				material["color"].setHex(this.folderLabelColorHighlighted)
			} else {
				material["color"]?.setHex(this.folderLabelColorNotHighlighted)
			}
		}
	}

	highlightSingleBuilding(building: CodeMapBuilding) {
		this.highlighted = []
		this.addBuildingToHighlightingList(building)
		this.highlightBuildings()
	}

	addBuildingToHighlightingList(building: CodeMapBuilding) {
		this.highlighted.push(building)
	}

	clearHoverHighlight() {
		this.highlighted = []
		this.highlightBuildings()
	}

	clearHighlight() {
		if (this.getMapMesh()) {
			this.getMapMesh().clearHighlight(this.selected)
			this.highlighted = []
			this.constantHighlight.clear()
			if (this.mapGeometry.children[0]) {
				this.resetMaterial(this.mapGeometry.children[0]["material"])
			}
		}
	}

	selectBuilding(building: CodeMapBuilding) {
		this.getMapMesh().selectBuilding(building, this.folderLabelColorSelected)
		this.selected = building
		this.highlightBuildings()
		this.$rootScope.$broadcast(ThreeSceneService.BUILDING_SELECTED_EVENT, this.selected)
		if (this.mapGeometry.children[0]) {
			this.selectMaterial(this.mapGeometry.children[0]["material"])
		}
	}

	hoverLabel(hoveredLabel: Object3D, raycaster: Raycaster, labels: Object3D[]) {
		if (hoveredLabel !== null && raycaster !== null) {
			this.resetLabel()

			hoveredLabel["material"].opacity = 1

			this.rayPoint = new Vector3()
			this.rayPoint.subVectors(raycaster.ray.origin, hoveredLabel.position)

			const norm = Math.sqrt(Math.pow(this.rayPoint.x, 2) + Math.pow(this.rayPoint.y, 2) + Math.pow(this.rayPoint.z, 2))
			const cameraPoint = raycaster.ray.origin
			const maxDistance = this.calculateMaxDistance(hoveredLabel, labels, cameraPoint, norm)

			this.normedTransformVector = new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm)
			this.normedTransformVector.multiplyScalar(maxDistance)

			hoveredLabel.position.add(this.normedTransformVector)

			this.modifiedLabel = hoveredLabel
		}
	}

	resetLabel() {
		if (this.modifiedLabel !== null) {
			this.modifiedLabel.position.sub(this.normedTransformVector)
			this.modifiedLabel["material"].opacity = this.mapLabelColors.alpha
			this.modifiedLabel = null
		}
	}
	getLabelForHoveredNode(hoveredBuilding: CodeMapBuilding, labels: Object3D[]) {
		if (labels === null) {
			return null
		}
		for (let counter = 0; counter < labels.length; counter += 2) {
			if (labels[counter].userData.node === hoveredBuilding.node) {
				return labels[counter]
			}
		}
		return null
	}

	private isOverlapping1D(minBox1: number, maxBox1: number, minBox2: number, maxBox2: number) {
		return maxBox1 >= minBox2 && maxBox2 >= minBox1
	}

	private getIntersectionDistance(bboxHoveredLabel: Box3, bboxObstructingLabel: Box3, normedVector: Vector3, distance: number) {
		normedVector.multiplyScalar(distance)
		bboxHoveredLabel.translate(normedVector)

		if (
			(this.isOverlapping1D(bboxObstructingLabel.min.x, bboxObstructingLabel.max.x, bboxHoveredLabel.min.x, bboxHoveredLabel.max.x) &&
				this.isOverlapping1D(
					bboxObstructingLabel.min.y,
					bboxObstructingLabel.max.y,
					bboxHoveredLabel.min.y,
					bboxHoveredLabel.max.y
				)) ||
			(this.isOverlapping1D(bboxObstructingLabel.min.x, bboxObstructingLabel.max.x, bboxHoveredLabel.min.x, bboxHoveredLabel.max.x) &&
				this.isOverlapping1D(
					bboxObstructingLabel.min.z,
					bboxObstructingLabel.max.z,
					bboxHoveredLabel.min.z,
					bboxHoveredLabel.max.z
				)) ||
			(this.isOverlapping1D(bboxObstructingLabel.min.y, bboxObstructingLabel.max.y, bboxHoveredLabel.min.y, bboxHoveredLabel.max.y) &&
				this.isOverlapping1D(
					bboxObstructingLabel.min.z,
					bboxObstructingLabel.max.z,
					bboxHoveredLabel.min.z,
					bboxHoveredLabel.max.z
				))
		) {
			return distance
		}
		return 0
	}

	private calculateMaxDistance(hoveredLabel: Object3D, labels: Object3D[], cameraPoint: Vector3, norm: number) {
		let maxDistance = 0
		for (let counter = 0; counter < labels.length; counter += 2) {
			const bboxHoveredLabel = new Box3().setFromObject(hoveredLabel)
			const centerPoint = new Vector3()
			bboxHoveredLabel.getCenter(centerPoint)
			const distanceLabelCenterToCamera = cameraPoint.distanceTo(centerPoint)
			let maxDistanceForLabel = distanceLabelCenterToCamera / 20 //creates a nice small highlighting for hovered, unobstructed labels, empirically gathered value

			if (labels[counter] !== hoveredLabel) {
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
		return maxDistance
	}

	addNodeAndChildrenToConstantHighlight(codeMapNode: CodeMapNode) {
		const { lookUp } = this.storeService.getState()
		const codeMapBuilding = lookUp.idToNode.get(codeMapNode.id)
		for (const { data } of hierarchy(codeMapBuilding)) {
			const building = lookUp.idToBuilding.get(data.id)
			if (building) {
				this.constantHighlight.set(building.id, building)
			}
		}
	}

	removeNodeAndChildrenFromConstantHighlight(codeMapNode: CodeMapNode) {
		const { lookUp } = this.storeService.getState()
		const codeMapBuilding = lookUp.idToNode.get(codeMapNode.id)
		for (const { data } of hierarchy(codeMapBuilding)) {
			const building = lookUp.idToBuilding.get(data.id)
			if (building) {
				this.constantHighlight.delete(building.id)
			}
		}
	}

	clearConstantHighlight() {
		if (this.constantHighlight.size > 0) {
			this.clearHighlight()
		}
	}

	clearSelection() {
		if (this.selected) {
			this.getMapMesh().clearSelection(this.selected)
			this.$rootScope.$broadcast(ThreeSceneService.BUILDING_DESELECTED_EVENT)
		}
		if (this.highlighted.length > 0) {
			this.highlightBuildings()
		}
		this.selected = null
		if (this.mapGeometry.children[0]) {
			this.resetMaterial(this.mapGeometry.children[0]["material"])
		}
	}

	initLights() {
		const ambilight = new AmbientLight(0x707070) // soft white light
		const light1 = new DirectionalLight(0xe0e0e0, 1)
		light1.position.set(50, 10, 8).normalize()

		const light2 = new DirectionalLight(0xe0e0e0, 1)
		light2.position.set(-50, 10, -8).normalize()

		this.lights.add(ambilight)
		this.lights.add(light1)
		this.lights.add(light2)
	}

	setMapMesh(mesh: CodeMapMesh) {
		const { mapSize } = this.storeService.getState().treeMap
		this.mapMesh = mesh

		// Reset children
		this.mapGeometry.children.length = 0

		this.mapGeometry.position.x = -mapSize
		this.mapGeometry.position.y = 0
		this.mapGeometry.position.z = -mapSize

		this.mapGeometry.add(this.mapMesh.getThreeMesh())
		this.notifyMapMeshChanged()
	}

	getMapMesh() {
		return this.mapMesh
	}

	getSelectedBuilding() {
		return this.selected
	}

	getHighlightedBuilding() {
		return this.highlighted[0]
	}

	getHighlightedNode() {
		if (this.getHighlightedBuilding()) {
			return this.getHighlightedBuilding().node
		}
		return null
	}

	private reselectBuilding() {
		if (this.selected) {
			const buildingToSelect: CodeMapBuilding = this.getMapMesh().getBuildingByPath(this.selected.node.path)
			if (buildingToSelect) {
				this.selectBuilding(buildingToSelect)
			}
		}
	}

	private notifyMapMeshChanged() {
		this.$rootScope.$broadcast(ThreeSceneService.CODE_MAP_MESH_CHANGED_EVENT, this.mapMesh)
	}

	static subscribeToBuildingDeselectedEvents($rootScope: IRootScopeService, subscriber: BuildingDeselectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_DESELECTED_EVENT, () => {
			subscriber.onBuildingDeselected()
		})
	}

	static subscribeToBuildingSelectedEvents($rootScope: IRootScopeService, subscriber: BuildingSelectedEventSubscriber) {
		$rootScope.$on(this.BUILDING_SELECTED_EVENT, (_event, selectedBuilding: CodeMapBuilding) => {
			subscriber.onBuildingSelected(selectedBuilding)
		})
	}

	static subscribeToCodeMapMeshChangedEvent($rootScope: IRootScopeService, subscriber: CodeMapMeshChangedSubscriber) {
		$rootScope.$on(this.CODE_MAP_MESH_CHANGED_EVENT, (_event, mapMesh: CodeMapMesh) => {
			subscriber.onCodeMapMeshChanged(mapMesh)
		})
	}
}
