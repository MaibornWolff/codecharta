import { Node, EdgeVisibility } from "../../codeCharta.model"
import { BuildingDeselectedEventSubscriber, BuildingSelectedEventSubscriber, ThreeSceneService } from "./threeViewer/threeSceneService"
import { Edge } from "../../codeCharta.model"
import { ArrowHelper, BufferGeometry, CubicBezierCurve3, Line, LineBasicMaterial, Object3D, Vector3 } from "three"
import { BuildingHoveredSubscriber, CodeMapMouseEventService, BuildingUnhoveredSubscriber } from "./codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { ColorConverter } from "../../util/color/colorConverter"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { StoreService } from "../../state/store.service"

export class CodeMapArrowService
	implements BuildingSelectedEventSubscriber, BuildingDeselectedEventSubscriber, BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private VERTICES_PER_LINE = 5
	private map: Map<String, Node>
	private arrows: Object3D[]

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private threeSceneService: ThreeSceneService) {
		this.arrows = new Array<Object3D>()
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		ThreeSceneService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
	}

	public onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		const state = this.storeService.getState()
		if (state.dynamicSettings.edgeMetric !== "None" && !selectedBuilding.node.flat) {
			this.clearArrows()
			this.showEdgesOfBuildings(state.fileSettings.edges)
		}
		this.scale()
	}

	public onBuildingDeselected() {
		this.clearArrows()
		this.addEdgePreview(null, this.storeService.getState().fileSettings.edges.filter(x => x.visible != EdgeVisibility.none))
	}

	public onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		const state = this.storeService.getState()
		if (state.dynamicSettings.edgeMetric !== "None" && !hoveredBuilding.node.flat) {
			this.clearArrows()
			this.showEdgesOfBuildings(state.fileSettings.edges)
		}
		this.scale()
	}

	public onBuildingUnhovered() {
		const state = this.storeService.getState()
		if (state.dynamicSettings.edgeMetric !== "None") {
			this.clearArrows()
			this.showEdgesOfBuildings(state.fileSettings.edges)
		}
		this.scale()
	}

	public clearArrows() {
		this.arrows = []
		while (this.threeSceneService.edgeArrows.children.length > 0) {
			this.threeSceneService.edgeArrows.children.pop()
		}
	}

	public addArrow(arrowTargetNode: Node, arrowOriginNode: Node, buildingIsOriginNode: boolean): void {
		const state = this.storeService.getState()
		const curveScale = 100 * state.appSettings.edgeHeight

		if (
			arrowTargetNode.attributes &&
			arrowTargetNode.attributes[state.dynamicSettings.heightMetric] &&
			arrowOriginNode.attributes &&
			arrowOriginNode.attributes[state.dynamicSettings.heightMetric]
		) {
			const curve = this.createCurve(arrowOriginNode, arrowTargetNode, curveScale)

			if (buildingIsOriginNode) {
				this.lightNodeBuilding(arrowTargetNode)
				const color = ColorConverter.convertHexToNumber(state.appSettings.mapColors.outgoingEdge)
				this.curveColoring(curve, color)
			} else {
				this.lightNodeBuilding(arrowOriginNode)
				const color = ColorConverter.convertHexToNumber(state.appSettings.mapColors.incomingEdge)
				this.curveColoring(curve, color)
			}
		}
	}

	public addEdgePreview(nodes: Node[], edges: Edge[]) {
		if (nodes) {
			this.map = this.getNodesAsMap(nodes)
		}

		for (const edge of edges) {
			const originNode: Node = this.map.get(edge.fromNodeName)
			const targetNode: Node = this.map.get(edge.toNodeName)
			if (originNode && targetNode && edge.visible !== EdgeVisibility.none && edge.visible) {
				const curveScale = 100 * this.storeService.getState().appSettings.edgeHeight
				const curve = this.createCurve(originNode, targetNode, curveScale)
				this.previewMode(curve, edge.visible)
			}
		}
	}

	public scale() {
		const scaling = this.storeService.getState().appSettings.scaling
		for (const arrow of this.arrows) {
			arrow.scale.x = scaling.x
			arrow.scale.y = scaling.y
			arrow.scale.z = scaling.z
		}
	}

	private showEdgesOfBuildings(edges: Edge[]) {
		const node = this.threeSceneService.getHighlightedNode()
		if (this.threeSceneService.getSelectedBuilding() && node) {
			this.buildPairingEdges(this.threeSceneService.getSelectedBuilding().node, edges)
			this.buildPairingEdges(node, edges)
		} else if (node) {
			this.buildPairingEdges(node, edges)
		} else if (this.threeSceneService.getSelectedBuilding()) {
			this.buildPairingEdges(this.threeSceneService.getSelectedBuilding().node, edges)
		} else {
			this.addEdgePreview(null, edges.filter(x => x.visible != EdgeVisibility.none))
		}
	}

	private buildPairingEdges(node: Node, edges: Edge[]) {
		for (const edge of edges) {
			const originNode: Node = this.map.get(edge.fromNodeName)
			const targetNode: Node = this.map.get(edge.toNodeName)
			if (originNode && targetNode && originNode.path === node.path) {
				this.addArrow(targetNode, originNode, true)
			} else if (originNode && targetNode && targetNode.path === node.path) {
				this.addArrow(targetNode, originNode, false)
			}
		}
		this.threeSceneService.highlightBuildings()
	}

	private createCurve(arrowOriginNode: Node, arrowTargetNode: Node, curveScale) {
		const bezierPoint2 = arrowOriginNode.outgoingEdgePoint.clone()
		const bezierPoint3 = arrowTargetNode.incomingEdgePoint.clone()
		const arrowHeight = Math.max(bezierPoint2.y + arrowTargetNode.height, bezierPoint3.y + 1) + curveScale
		bezierPoint2.setY(arrowHeight)
		bezierPoint3.setY(arrowHeight)
		return new CubicBezierCurve3(arrowOriginNode.outgoingEdgePoint, bezierPoint2, bezierPoint3, arrowTargetNode.incomingEdgePoint)
	}

	private lightNodeBuilding(node: Node) {
		const building: CodeMapBuilding = this.threeSceneService
			.getMapMesh()
			.getMeshDescription()
			.getBuildingByPath(node.path)
		this.threeSceneService.addBuildingToHighlightingList(building)
	}

	private curveColoring(bezier: CubicBezierCurve3, color: number, bezierPoints: number = 50) {
		const points = bezier.getPoints(bezierPoints)
		const curveObject = this.buildLine(points, color)
		curveObject.add(this.buildArrow(points))
		this.threeSceneService.edgeArrows.add(curveObject)
		this.arrows.push(curveObject)
	}

	private previewMode(curve, edgeVisibility: EdgeVisibility) {
		if (edgeVisibility === EdgeVisibility.both || edgeVisibility === EdgeVisibility.from) {
			const outgoingArrow: Object3D = this.makeArrowFromBezier(curve, false)
			this.threeSceneService.edgeArrows.add(outgoingArrow)
			this.arrows.push(outgoingArrow)
		}

		if (edgeVisibility === EdgeVisibility.both || edgeVisibility === EdgeVisibility.to) {
			const incomingArrow: Object3D = this.makeArrowFromBezier(curve, true)
			this.threeSceneService.edgeArrows.add(incomingArrow)
			this.arrows.push(incomingArrow)
		}
	}

	private getNodesAsMap(nodes: Node[]): Map<string, Node> {
		const map = new Map<string, Node>()
		nodes.forEach(node => map.set(node.path, node))
		return map
	}

	private makeArrowFromBezier(bezier: CubicBezierCurve3, incoming: boolean, bezierPoints: number = 50) {
		const points = bezier.getPoints(bezierPoints)
		let pointsPreviews: Vector3[]
		let arrowColor: string

		if (incoming) {
			pointsPreviews = points.slice(bezierPoints + 1 - this.VERTICES_PER_LINE)
			arrowColor = this.storeService.getState().appSettings.mapColors.incomingEdge
		} else {
			pointsPreviews = points
				.reverse()
				.slice(bezierPoints + 1 - this.VERTICES_PER_LINE)
				.reverse()
			arrowColor = this.storeService.getState().appSettings.mapColors.outgoingEdge
		}

		return this.buildEdge(pointsPreviews, ColorConverter.convertHexToNumber(arrowColor))
	}

	private buildEdge(points: Vector3[], color: number): Object3D {
		const curveObject = this.buildLine(points, color)
		curveObject.add(this.buildArrow(points))

		return curveObject
	}

	private buildLine(points: Vector3[], color: number = 0) {
		const geometry = new BufferGeometry()
		geometry.setFromPoints(points)

		const material = new LineBasicMaterial({ color, linewidth: 1 })
		return new Line(geometry, material)
	}

	private buildArrow(points: Vector3[], ARROW_COLOR: number = 0, headLength: number = 10, headWidth: number = 10) {
		const dir = points[points.length - 1]
			.clone()
			.sub(points[points.length - 2].clone())
			.normalize()

		const origin = points[points.length - 1].clone()
		if (dir.y < 0) {
			origin.y += headLength + 1
		}
		return new ArrowHelper(dir, origin, headLength + 1, ARROW_COLOR, headLength, headWidth)
	}
}
