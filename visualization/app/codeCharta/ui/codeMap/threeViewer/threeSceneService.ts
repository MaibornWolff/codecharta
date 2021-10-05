import {
	AmbientLight,
	DirectionalLight,
	Scene,
	Group,
	Material,
	Raycaster,
	Vector3,
	Object3D,
	Box3,
	Line,
	BufferGeometry,
	PlaneGeometry,
	MeshBasicMaterial,
	Mesh,
	DoubleSide,
	CanvasTexture,
	RepeatWrapping
} from "three"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { CodeMapPreRenderServiceSubscriber, CodeMapPreRenderService } from "../codeMap.preRender.service"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { CodeMapNode, MapColors, Node } from "../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { ColorConverter } from "../../../util/color/colorConverter"
import { MapColorsSubscriber, MapColorsService } from "../../../state/store/appSettings/mapColors/mapColors.service"

export interface BuildingSelectedEventSubscriber {
	onBuildingSelected(selectedBuilding?: CodeMapBuilding)
}

export interface BuildingDeselectedEventSubscriber {
	onBuildingDeselected()
}

export interface CodeMapMeshChangedSubscriber {
	onCodeMapMeshChanged(mapMesh: CodeMapMesh)
}

export class ThreeSceneService implements CodeMapPreRenderServiceSubscriber, MapColorsSubscriber {
	private static readonly BUILDING_SELECTED_EVENT = "building-selected"
	private static readonly BUILDING_DESELECTED_EVENT = "building-deselected"
	private static readonly CODE_MAP_MESH_CHANGED_EVENT = "code-map-mesh-changed"

	scene: Scene
	labels: Group
	floorLabels: Group
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
	private numberSelectionColor = ColorConverter.convertHexToNumber(this.folderLabelColorSelected)
	private rayPoint = new Vector3(0, 0, 0)
	private normedTransformVector = new Vector3(0, 0, 0)
	private highlightedLabel = null
	private highlightedLineIndex = -1
	private highlightedLine = null
	private mapLabelColors = this.storeService.getState().appSettings.mapColors.labelColorAndAlpha

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		MapColorsService.subscribe(this.$rootScope, this)
		CodeMapPreRenderService.subscribe(this.$rootScope, this)

		this.scene = new Scene()
		this.mapGeometry = new Group()
		this.lights = new Group()
		this.labels = new Group()
		this.floorLabels = new Group()
		this.edgeArrows = new Group()

		this.initLights()

		this.scene.add(this.mapGeometry)
		this.scene.add(this.edgeArrows)
		this.scene.add(this.labels)
		this.scene.add(this.lights)
		this.scene.add(this.floorLabels)
	}

	private initFloorLabels() {
		this.floorLabels.clear()

		const floorSurfaceInformation = new Map([
			[0, []],
			[1, []],
			[2, []]
		])

		let rootNode
		for (const node of this.mapMesh.getNodes().values()) {
			if (node.id === 0) {
				rootNode = node
			}
			if (!node.isLeaf && node.mapNodeDepth !== undefined && node.mapNodeDepth >= 0 && node.mapNodeDepth < 3) {
				floorSurfaceInformation.get(node.mapNodeDepth).push(node)
			}
		}

		if (rootNode === undefined) {
			return
		}

		const canvases = document.getElementsByTagName("canvas")
		const mapCanvas = canvases[canvases.length - 1]
		const displayWidth = mapCanvas.width

		let mapResolutionScaling = 1

		let mapWidth = rootNode.width
		let mapHeight = rootNode.length

		const fullHdPlusWidth = 2560
		const scalingThreshold = Math.min(displayWidth * 4, fullHdPlusWidth * 4)

		if (mapWidth >= scalingThreshold || mapHeight >= scalingThreshold) {
			mapResolutionScaling = scalingThreshold / mapWidth
		}

		mapWidth = mapWidth * mapResolutionScaling
		mapHeight = mapHeight * mapResolutionScaling

		const { mapSize } = this.storeService.getState().treeMap
		const scale = this.storeService.getState().appSettings.scaling

		for (const [floorLevel, surfaceNodesPerLevel] of floorSurfaceInformation.entries()) {
			const textCanvas = document.createElement("canvas")
			textCanvas.height = mapHeight
			textCanvas.width = mapWidth

			const context = textCanvas.getContext("2d")

			context.fillStyle = "white"
			context.textAlign = "center"
			context.textBaseline = "middle"

			for (const surfaceNode of surfaceNodesPerLevel) {
				let fontSize =
					surfaceNode.depth === 0
						? Math.max(Math.floor(rootNode.width * 0.03), 120)
						: Math.max(Math.floor(rootNode.width * 0.023), 95)
				fontSize = Math.floor(fontSize * mapResolutionScaling)

				context.font = `${fontSize}px Arial`

				const textToFill = this.getLabelAndSetContextFont(surfaceNode, context, mapResolutionScaling, fontSize)

				context.fillText(
					textToFill.labelText,
					(rootNode.length - surfaceNode.y0 - surfaceNode.length / 2) * mapResolutionScaling,
					(surfaceNode.x0 + surfaceNode.width) * mapResolutionScaling - textToFill.fontSize / 2
				)
			}

			const labelTexture = new CanvasTexture(textCanvas)
			labelTexture.wrapS = RepeatWrapping
			labelTexture.wrapT = RepeatWrapping
			labelTexture.repeat.x = -1
			labelTexture.needsUpdate = true
			labelTexture.rotation = (90 * Math.PI) / 180

			const plane = new PlaneGeometry(mapWidth, mapHeight)
			const material = new MeshBasicMaterial({
				side: DoubleSide,
				map: labelTexture,
				transparent: true
			})

			const planeMesh = new Mesh(plane, material)

			this.floorLabels.add(planeMesh)

			planeMesh.rotateX((90 * Math.PI) / 180)
			// TODO Check if we can replace the lift of -10 (z-axis) to prevent z-buffer-fighting by the highest z value of all nodes.
			plane.translate(mapWidth / 2, mapHeight / 2, -2.01 * (floorLevel + 1) - 10)

			planeMesh.scale.set(scale.x / mapResolutionScaling, scale.y / mapResolutionScaling, scale.z)
			planeMesh.position.set(-mapSize * scale.x, 0, -mapSize * scale.z)
		}

		this.scene.add(this.floorLabels)
	}

	private getLabelAndSetContextFont(
		surfaceNode: Node,
		context: CanvasRenderingContext2D,
		mapResolutionScaling: number,
		fontSize: number
	) {
		const labelText = surfaceNode.name
		const surfaceWidth = surfaceNode.length * mapResolutionScaling

		context.font = `${fontSize}px Arial`

		const textMetrics = context.measureText(labelText)
		const fontScaleFactor = this.getFontScaleFactor(surfaceWidth, textMetrics.width)
		if (fontScaleFactor <= 0.5) {
			// Font will be to small.
			// So scale text not smaller than 0.5 and shorten it as well
			fontSize = fontSize * 0.5
			fontSize = Math.floor(Math.min(fontSize, surfaceNode.width * mapResolutionScaling))
			context.font = `${fontSize}px Arial`
			return {
				labelText: this.getFittingLabelText(context, surfaceWidth, labelText),
				fontSize
			}
		}
		fontSize = Math.floor(Math.min(fontSize * fontScaleFactor, surfaceNode.width * mapResolutionScaling))
		context.font = `${fontSize}px Arial`
		return { labelText, fontSize }
	}

	private getFontScaleFactor(canvasWidth: number, widthOfText: number) {
		return widthOfText < canvasWidth ? 1 : canvasWidth / widthOfText
	}

	private getFittingLabelText(context: CanvasRenderingContext2D, canvasWidth: number, labelText: string) {
		const { width } = context.measureText(labelText)
		let textSplitIndex = Math.floor((labelText.length * canvasWidth) / width)
		let abbreviatedText = `${labelText.slice(0, textSplitIndex)}...`

		// TODO: Check if this is expensive. If it is, let's use a logarithmic algorithm instead.
		while (context.measureText(abbreviatedText).width >= canvasWidth && textSplitIndex > 1) {
			// textSplitIndex > 1 to ensure it contains at least one char
			textSplitIndex -= 1
			abbreviatedText = `${labelText.slice(0, textSplitIndex)}...`
		}

		return abbreviatedText
	}

	onMapColorsChanged(mapColors: MapColors) {
		this.folderLabelColorSelected = mapColors.selected
		this.numberSelectionColor = ColorConverter.convertHexToNumber(this.folderLabelColorSelected)
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
		this.getMapMesh().selectBuilding(building, this.folderLabelColorSelected)
		this.selected = building
		this.highlightBuildings()
		this.$rootScope.$broadcast(ThreeSceneService.BUILDING_SELECTED_EVENT, this.selected)
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
			const cameraPoint = raycaster.ray.origin
			const maxDistance = this.calculateMaxDistance(hoveredLabel, labels, cameraPoint, norm)

			this.normedTransformVector = new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm)
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
			this.highlightedLabel.material.opacity = this.mapLabelColors.alpha

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
		if (!labels) {
			return null
		}
		// 2-step: the labels array consists of alternating label and the corresponding label antennae
		for (let counter = 0; counter < labels.length; counter += 2) {
			if (labels[counter].userData.node === hoveredBuilding.node) {
				return labels[counter]
			}
		}
		return null
	}

	private isOverlapping(a: Box3, b: Box3, dimension: string) {
		return Number(a.max[dimension] >= b.min[dimension] && b.max[dimension] >= a.min[dimension])
	}

	private getIntersectionDistance(bboxHoveredLabel: Box3, bboxObstructingLabel: Box3, normedVector: Vector3, distance: number) {
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

	private calculateMaxDistance(hoveredLabel: Object3D, labels: Object3D[], cameraPoint: Vector3, norm: number) {
		let maxDistance = 0

		const bboxHoveredLabel = new Box3().setFromObject(hoveredLabel)
		const centerPoint = new Vector3()
		bboxHoveredLabel.getCenter(centerPoint)
		const distanceLabelCenterToCamera = cameraPoint.distanceTo(centerPoint)
		let maxDistanceForLabel = distanceLabelCenterToCamera / 20

		for (let counter = 0; counter < labels.length; counter += 2) {
			//creates a nice small highlighting for hovered, unobstructed labels, empirically gathered value

			const bboxHoveredLabelWorkingCopy = bboxHoveredLabel.clone()

			if (labels[counter] !== hoveredLabel) {
				const bboxObstructingLabel = new Box3().setFromObject(labels[counter])
				const centerPoint2 = new Vector3()

				bboxObstructingLabel.getCenter(centerPoint2)

				maxDistanceForLabel = Math.max(
					this.getIntersectionDistance(
						bboxHoveredLabelWorkingCopy,
						bboxObstructingLabel,
						new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm),
						distanceLabelCenterToCamera - cameraPoint.distanceTo(centerPoint2)
					),
					this.getIntersectionDistance(
						bboxHoveredLabelWorkingCopy,
						bboxObstructingLabel,
						new Vector3(this.rayPoint.x / norm, this.rayPoint.y / norm, this.rayPoint.z / norm),
						distanceLabelCenterToCamera - cameraPoint.distanceTo(bboxObstructingLabel.max)
					),
					this.getIntersectionDistance(
						bboxHoveredLabelWorkingCopy,
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
		const ambilight = new AmbientLight(0x70_70_70) // soft white light
		const light1 = new DirectionalLight(0xe0_e0_e0, 1)
		light1.position.set(50, 10, 8).normalize()

		const light2 = new DirectionalLight(0xe0_e0_e0, 1)
		light2.position.set(-50, 10, -8).normalize()

		this.lights.add(ambilight)
		this.lights.add(light1)
		this.lights.add(light2)
	}

	setMapMesh(mesh: CodeMapMesh) {
		const { mapSize } = this.storeService.getState().treeMap
		this.mapMesh = mesh

		this.initFloorLabels()

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

	dispose() {
		this.mapMesh?.dispose()
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
