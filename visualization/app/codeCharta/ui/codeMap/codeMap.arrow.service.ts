import { BuildingDeselectedEventSubscriber, BuildingSelectedEventSubscriber, ThreeSceneService } from "./threeViewer/threeSceneService"
import { Node, EdgeVisibility } from "../../codeCharta.model"
import { ArrowHelper, BufferGeometry, CubicBezierCurve3, Line, LineBasicMaterial, Object3D, Vector3 } from "three"
import { BuildingHoveredSubscriber, CodeMapMouseEventService, BuildingUnhoveredSubscriber } from "./codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { ColorConverter } from "../../util/color/colorConverter"
import { CodeMapBuilding } from "./rendering/codeMapBuilding"
import { StoreService } from "../../state/store.service"

export class CodeMapArrowService
	implements BuildingSelectedEventSubscriber, BuildingDeselectedEventSubscriber, BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private VERTICES_PER_LINE = 5
	private map: Map<string, Node>
	private arrows: Object3D[]

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private threeSceneService: ThreeSceneService) {
		this.arrows = new Array<Object3D>()
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		ThreeSceneService.subscribeToBuildingSelectedEvents(this.$rootScope, this)
		ThreeSceneService.subscribeToBuildingDeselectedEvents(this.$rootScope, this)
	}

	onBuildingSelected(selectedBuilding: CodeMapBuilding) {
		if (this.isEdgeApplicableForBuilding(selectedBuilding)) {
			this.clearArrows()
			this.showEdgesOfBuildings()
		}
		this.scale()
	}

	onBuildingDeselected() {
		this.clearArrows()
		this.threeSceneService.clearHighlight()
		this.addEdgePreview()
	}

	onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		if (this.isEdgeApplicableForBuilding(hoveredBuilding)) {
			this.clearArrows()
			this.showEdgesOfBuildings(hoveredBuilding)
		}
		this.scale()
	}

	onBuildingUnhovered() {
		const state = this.storeService.getState()
		if (state.dynamicSettings.edgeMetric !== "None") {
			this.clearArrows()
			this.showEdgesOfBuildings()
		}
		this.scale()
	}

	clearArrows() {
		this.arrows = []
		// Remove all children
		this.threeSceneService.edgeArrows.children.length = 0
	}

	addArrow(arrowTargetNode: Node, arrowOriginNode: Node, buildingIsOriginNode: boolean) {
		const { appSettings, dynamicSettings } = this.storeService.getState()
		const curveScale = 100 * appSettings.edgeHeight

		if (arrowTargetNode.attributes?.[dynamicSettings.heightMetric] && arrowOriginNode.attributes?.[dynamicSettings.heightMetric]) {
			const curve = this.createCurve(arrowOriginNode, arrowTargetNode, curveScale)
			const color = ColorConverter.getNumber(appSettings.mapColors[buildingIsOriginNode ? "outgoingEdge" : "incomingEdge"])
			this.highlightBuilding(buildingIsOriginNode ? arrowTargetNode : arrowOriginNode)
			this.setCurveColor(curve, color)
		}
	}

	addEdgePreview(nodes?: Node[]) {
		if (nodes) {
			this.map = this.getNodesAsMap(nodes)
		}

		const { edges } = this.storeService.getState().fileSettings

		for (const edge of edges) {
			const originNode = this.map.get(edge.fromNodeName)
			const targetNode = this.map.get(edge.toNodeName)
			if (originNode && targetNode && edge.visible !== EdgeVisibility.none && edge.visible) {
				//TODO It seems originNode or targetNode might be undefined here,
				// I think it results from the method being called multiple times when it might not be available yet
				// I changed that back to avoid console errors and re-enable the edge-metric, however we should investigate why this is happening
				const curveScale = 100 * this.storeService.getState().appSettings.edgeHeight
				const curve = this.createCurve(originNode, targetNode, curveScale)
				this.previewMode(curve, edge.visible)
			}
		}
	}

	scale() {
		const { scaling } = this.storeService.getState().appSettings
		for (const arrow of this.arrows) {
			arrow.scale.x = scaling.x
			arrow.scale.y = scaling.y
			arrow.scale.z = scaling.z
		}
	}

	private isEdgeApplicableForBuilding(codeMapBuilding: CodeMapBuilding) {
		return this.storeService.getState().dynamicSettings.edgeMetric !== "None" && !codeMapBuilding.node.flat
	}

	private showEdgesOfBuildings(hoveredbuilding?: CodeMapBuilding) {
		const buildings: Map<string, Node> = new Map()
		const selectedBuilding = this.threeSceneService.getSelectedBuilding()

		if (selectedBuilding) {
			const { node } = selectedBuilding
			buildings.set(node.path, node)
		}
		if (hoveredbuilding) {
			const { node } = hoveredbuilding
			buildings.set(node.path, node)
		}
		if (buildings.size > 0) {
			this.buildPairingEdges(buildings)
		} else {
			this.addEdgePreview()
		}
	}

	private buildPairingEdges(node: Map<string, Node>) {
		const { edges } = this.storeService.getState().fileSettings

		for (const edge of edges) {
			const originNode = this.map.get(edge.fromNodeName)
			// TODO: Maps should only have valid edges. If that's not the case, the
			// internal decoration is likely faulty. Check if only test data is not
			// correct or what the root cause of these checks actually is.
			if (originNode === undefined) {
				continue
			}
			const targetNode = this.map.get(edge.toNodeName)
			if (targetNode === undefined) {
				continue
			}
			if (node.has(originNode.path)) {
				this.addArrow(targetNode, originNode, true)
				// TODO: Check if the second if case is actually necessary. Edges should
				// always have valid origin and target paths. The test data is likely
				// faulty and should be improved.
			} else if (node.has(targetNode.path)) {
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

	private highlightBuilding(node: Node) {
		const building = this.threeSceneService.getMapMesh().getMeshDescription().getBuildingByPath(node.path)
		this.threeSceneService.addBuildingToHighlightingList(building)
	}

	private setCurveColor(bezier: CubicBezierCurve3, color: number, bezierPoints = 50) {
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

	private getNodesAsMap(nodes: Node[]) {
		const map: Map<string, Node> = new Map()
		nodes.forEach(node => map.set(node.path, node))
		return map
	}

	private makeArrowFromBezier(bezier: CubicBezierCurve3, incoming: boolean, bezierPoints = 50) {
		const points = bezier.getPoints(bezierPoints)
		const { incomingEdge, outgoingEdge } = this.storeService.getState().appSettings.mapColors
		const arrowColor = incoming ? incomingEdge : outgoingEdge
		const pointsPreviews = incoming
			? points.slice(bezierPoints + 1 - this.VERTICES_PER_LINE)
			: points.slice(0, points.length - (bezierPoints + 1 - this.VERTICES_PER_LINE))

		return this.buildEdge(pointsPreviews, ColorConverter.getNumber(arrowColor))
	}

	private buildEdge(points: Vector3[], color: number): Object3D {
		const curveObject = this.buildLine(points, color)
		curveObject.add(this.buildArrow(points))

		return curveObject
	}

	private buildLine(points: Vector3[], color = 0) {
		const geometry = new BufferGeometry()
		geometry.setFromPoints(points)

		const material = new LineBasicMaterial({ color, linewidth: 1 })
		return new Line(geometry, material)
	}

	private buildArrow(points: Vector3[], ARROW_COLOR = 0, headLength = 10, headWidth = 10) {
		const direction = points[points.length - 1]
			.clone()
			.sub(points[points.length - 2].clone())
			.normalize()

		const origin = points[points.length - 1].clone()
		if (direction.y < 0) {
			origin.y += headLength + 1
		}
		return new ArrowHelper(direction, origin, headLength + 1, ARROW_COLOR, headLength, headWidth)
	}
}
