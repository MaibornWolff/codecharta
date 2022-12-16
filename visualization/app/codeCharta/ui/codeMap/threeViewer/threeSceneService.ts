import { AmbientLight, Box3, BufferGeometry, DirectionalLight, Group, Line, Material, Object3D, Raycaster, Scene, Vector3 } from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { CodeMapNode, LayoutAlgorithm, Node } from "../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { ColorConverter } from "../../../util/color/colorConverter"
import { FloorLabelDrawer } from "./floorLabels/floorLabelDrawer"
import { setSelectedBuildingId } from "../../../state/store/appStatus/selectedBuildingId/selectedBuildingId.actions"
import { idToNodeSelector } from "../../../state/selectors/accumulatedData/idToNode.selector"
import { IdToBuildingService } from "../../../services/idToBuilding/idToBuilding.service"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { ThreeRendererService } from "./threeRenderer.service"
import { EventEmitter } from "tsee"
import { Inject, Injectable } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { defaultMapColors } from "../../../state/store/appSettings/mapColors/mapColors.actions"
import { State } from "../../../state/angular-redux/state"
import { treeMapSize } from "../../../util/algorithm/treeMapLayout/treeMapHelper"

type BuildingSelectedEvents = {
	onBuildingSelected: (data: { building: CodeMapBuilding }) => void
	onBuildingDeselected: () => void
}

@Injectable({ providedIn: "root" })
export class ThreeSceneService {
	scene: Scene
	labels: Group
	floorLabelPlanes: Group
	edgeArrows: Group
	mapGeometry: Group

	private readonly lights: Group
	private mapMesh: CodeMapMesh
	private eventEmitter = new EventEmitter<BuildingSelectedEvents>()

	private floorLabelDrawer

	private selected: CodeMapBuilding = null
	private highlighted: CodeMapBuilding[] = []
	private constantHighlight: Map<number, CodeMapBuilding> = new Map()

	private folderLabelColorHighlighted = ColorConverter.convertHexToNumber("#FFFFFF")
	private folderLabelColorNotHighlighted = ColorConverter.convertHexToNumber("#7A7777")
	private folderLabelColorSelected: string
	private numberSelectionColor: number
	private rayPoint = new Vector3(0, 0, 0)
	private normedTransformVector = new Vector3(0, 0, 0)
	private highlightedLabel = null
	private highlightedLineIndex = -1
	private highlightedLine = null

	constructor(
		@Inject(Store) private store: Store,
		@Inject(State) private state: State,
		@Inject(IdToBuildingService) private idToBuilding: IdToBuildingService,
		@Inject(ThreeRendererService) private threeRendererService: ThreeRendererService
	) {
		this.store.select(mapColorsSelector).subscribe(mapColors => {
			this.folderLabelColorSelected = mapColors.selected
			this.numberSelectionColor = ColorConverter.convertHexToNumber(this.folderLabelColorSelected)
		})

		this.scene = new Scene()
		this.mapGeometry = new Group()
		this.lights = new Group()
		this.labels = new Group()
		this.floorLabelPlanes = new Group()
		this.edgeArrows = new Group()

		this.initLights()

		this.scene.add(this.mapGeometry)
		this.scene.add(this.edgeArrows)
		this.scene.add(this.labels)
		this.scene.add(this.lights)
		this.scene.add(this.floorLabelPlanes)
	}

	private initFloorLabels(nodes: Node[]) {
		this.floorLabelPlanes.clear()

		const { layoutAlgorithm, enableFloorLabels } = this.state.getValue().appSettings
		if (layoutAlgorithm !== LayoutAlgorithm.SquarifiedTreeMap || !enableFloorLabels) {
			return
		}

		const rootNode = this.getRootNode(nodes)
		if (!rootNode) {
			return
		}
		const scaling = this.state.getValue().appSettings.scaling
		const scalingVector = new Vector3(scaling.x, scaling.y, scaling.z)

		this.floorLabelDrawer = new FloorLabelDrawer(this.mapMesh.getNodes(), rootNode, treeMapSize, scalingVector)
		const floorLabels = this.floorLabelDrawer.draw(this.state.getValue())

		if (floorLabels.length > 0) {
			this.floorLabelPlanes.add(...floorLabels)
			this.scene.add(this.floorLabelPlanes)
		}
	}

	private getRootNode(nodes: Node[]) {
		return nodes.find(node => node.id === 0)
	}

	getConstantHighlight() {
		return this.constantHighlight
	}

	highlightBuildings() {
		const state = this.state.getValue()
		this.getMapMesh().highlightBuilding(this.highlighted, this.selected, state, this.constantHighlight)
		if (this.mapGeometry.children[0]) {
			this.highlightMaterial(this.mapGeometry.children[0]["material"])
		}
		this.threeRendererService.render()
	}

	private selectMaterial(materials: Material[]) {
		const selectedMaterial = materials.find(({ userData }) => userData.id === this.selected.node.id)
		selectedMaterial?.["color"].setHex(this.numberSelectionColor)
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
		const scale = this.state.getValue().appSettings.scaling
		this.floorLabelDrawer?.translatePlaneCanvases(scale)
		this.mapGeometry.scale.set(scale.x, scale.y, scale.z)
		this.mapGeometry.position.set(-treeMapSize * scale.x, 0, -treeMapSize * scale.z)
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
				material["color"].setHex(this.numberSelectionColor)
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
		// TODO: This check shouldn't be necessary. When investing into model we should investigate why and remove the need.
		if (building.id !== this.selected?.id) {
			this.store.dispatch(setSelectedBuildingId(building.node.id))
		}

		this.getMapMesh().selectBuilding(building, this.folderLabelColorSelected)
		this.selected = building
		this.highlightBuildings()

		this.eventEmitter.emit("onBuildingSelected", { building: this.selected })
		if (this.mapGeometry.children[0]) {
			this.selectMaterial(this.mapGeometry.children[0]["material"])
		}
	}

	animateLabel(hoveredLabel: Object3D, raycaster: Raycaster, labels: Object3D[]) {
		if (hoveredLabel !== null && raycaster !== null) {
			this.resetLabel()

			if (hoveredLabel["material"]) {
				hoveredLabel["material"].opacity = 1
			}

			this.highlightedLineIndex = this.getHoveredLabelLineIndex(labels, hoveredLabel)
			this.highlightedLine = labels[this.highlightedLineIndex]

			this.rayPoint = new Vector3()
			this.rayPoint.subVectors(raycaster.ray.origin, hoveredLabel.position)

			const norm = Math.sqrt(this.rayPoint.x ** 2 + this.rayPoint.y ** 2 + this.rayPoint.z ** 2)
			this.normedTransformVector = new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm)

			const cameraPoint = raycaster.ray.origin
			const maxDistance = this.calculateMaxDistance(hoveredLabel, labels, cameraPoint)

			this.normedTransformVector.multiplyScalar(maxDistance)

			hoveredLabel.position.add(this.normedTransformVector)

			this.toggleLineAnimation(hoveredLabel)

			this.highlightedLabel = hoveredLabel
		}
	}

	resetLineHighlight() {
		this.highlightedLineIndex = -1
		this.highlightedLine = null
	}

	resetLabel() {
		if (this.highlightedLabel !== null) {
			this.highlightedLabel.position.sub(this.normedTransformVector)
			this.highlightedLabel.material.opacity = defaultMapColors.labelColorAndAlpha.alpha

			if (this.highlightedLine) {
				this.toggleLineAnimation(this.highlightedLabel)
			}

			this.highlightedLabel = null
		}
	}

	getHoveredLabelLineIndex(labels: Object3D[], label: Object3D) {
		const index = labels.findIndex(({ uuid }) => uuid === label.uuid)

		if (index >= 0) {
			return index + 1
		}
	}

	toggleLineAnimation(hoveredLabel: Object3D) {
		const endPoint = new Vector3(hoveredLabel.position.x, hoveredLabel.position.y, hoveredLabel.position.z)

		const pointsBufferGeometry = this.highlightedLine.geometry as BufferGeometry
		const pointsArray = pointsBufferGeometry.attributes.position.array as Array<number>

		const geometry = new BufferGeometry().setFromPoints([new Vector3(pointsArray[0], pointsArray[1], pointsArray[2]), endPoint])

		const newLineForHighlightedLabel = new Line(geometry, this.highlightedLine.material)

		this.labels.children.splice(this.highlightedLineIndex, 1, newLineForHighlightedLabel)
	}

	getLabelForHoveredNode(hoveredBuilding: CodeMapBuilding, labels: Object3D[]) {
		// 2-step: the labels array consists of alternating label and the corresponding label antennae
		for (let counter = 0; counter < labels?.length; counter += 2) {
			if (labels[counter].userData.node === hoveredBuilding.node) {
				return labels[counter]
			}
		}
		return null
	}

	private isOverlapping(a: Box3, b: Box3, dimension: string) {
		return Number(a.max[dimension] >= b.min[dimension] && b.max[dimension] >= a.min[dimension])
	}

	private getIntersectionDistanceFunction(bboxHoveredLabel: Box3, bboxObstructingLabel: Box3) {
		return (distance: number) => {
			const normedVector = this.normedTransformVector.clone()
			normedVector.multiplyScalar(distance)
			bboxHoveredLabel.translate(normedVector)
			const count =
				this.isOverlapping(bboxObstructingLabel, bboxHoveredLabel, "x") +
				this.isOverlapping(bboxObstructingLabel, bboxHoveredLabel, "y")
			if (count === 2 || (count === 1 && this.isOverlapping(bboxObstructingLabel, bboxHoveredLabel, "z"))) {
				return distance
			}
			return 0
		}
	}

	private calculateMaxDistance(hoveredLabel: Object3D, labels: Object3D[], cameraPoint: Vector3) {
		const bboxHoveredLabel = new Box3().setFromObject(hoveredLabel)
		const centerPoint = new Vector3()
		bboxHoveredLabel.getCenter(centerPoint)
		const distanceLabelCenterToCamera = cameraPoint.distanceTo(centerPoint)
		let maxDistance = distanceLabelCenterToCamera / 20

		for (let counter = 0; counter < labels.length; counter += 2) {
			// Creates a nice small highlighting for hovered, unobstructed
			// labels, empirically gathered value.
			if (labels[counter] !== hoveredLabel) {
				const bboxHoveredLabelWorkingCopy = bboxHoveredLabel.clone()
				const bboxObstructingLabel = new Box3().setFromObject(labels[counter])
				const centerPoint2 = new Vector3()

				bboxObstructingLabel.getCenter(centerPoint2)

				const calculateIntersectionDistance = this.getIntersectionDistanceFunction(
					bboxHoveredLabelWorkingCopy,
					bboxObstructingLabel
				)

				maxDistance = Math.max(
					calculateIntersectionDistance(distanceLabelCenterToCamera - cameraPoint.distanceTo(centerPoint2)),
					calculateIntersectionDistance(distanceLabelCenterToCamera - cameraPoint.distanceTo(bboxObstructingLabel.max)),
					calculateIntersectionDistance(distanceLabelCenterToCamera - cameraPoint.distanceTo(bboxObstructingLabel.min)),
					maxDistance
				)
			}
		}
		return maxDistance
	}

	addNodeAndChildrenToConstantHighlight(codeMapNode: Pick<CodeMapNode, "id">) {
		const idToNode = idToNodeSelector(this.state.getValue())
		const codeMapBuilding = idToNode.get(codeMapNode.id)
		for (const { data } of hierarchy(codeMapBuilding)) {
			const building = this.idToBuilding.get(data.id)
			if (building) {
				this.constantHighlight.set(building.id, building)
			}
		}
	}

	removeNodeAndChildrenFromConstantHighlight(codeMapNode: Pick<CodeMapNode, "id">) {
		const idToNode = idToNodeSelector(this.state.getValue())
		const codeMapBuilding = idToNode.get(codeMapNode.id)
		for (const { data } of hierarchy(codeMapBuilding)) {
			const building = this.idToBuilding.get(data.id)
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
			this.store.dispatch(setSelectedBuildingId(null))
			this.eventEmitter.emit("onBuildingDeselected")
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
		const ambilight = new AmbientLight(0x70_70_70) // soft white light
		const light1 = new DirectionalLight(0xe0_e0_e0, 1)
		light1.position.set(50, 10, 8).normalize()

		const light2 = new DirectionalLight(0xe0_e0_e0, 1)
		light2.position.set(-50, 10, -8).normalize()

		this.lights.add(ambilight)
		this.lights.add(light1)
		this.lights.add(light2)
	}

	setMapMesh(nodes: Node[], mesh: CodeMapMesh) {
		this.mapMesh = mesh

		this.initFloorLabels(nodes)

		// Reset children
		this.mapGeometry.children.length = 0

		this.mapGeometry.position.x = -treeMapSize
		this.mapGeometry.position.y = 0
		this.mapGeometry.position.z = -treeMapSize

		this.mapGeometry.add(this.mapMesh.getThreeMesh())

		this.idToBuilding.setIdToBuilding(this.mapMesh.getMeshDescription().buildings)
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

	dispose() {
		this.mapMesh?.dispose()
	}

	subscribe<Key extends keyof BuildingSelectedEvents>(key: Key, callback: BuildingSelectedEvents[Key]) {
		this.eventEmitter.on(key, (data?) => {
			callback(data)
		})
	}
}
