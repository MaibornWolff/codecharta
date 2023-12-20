import { Injectable, OnDestroy } from "@angular/core"
import { ThreeSceneService } from "../threeViewer/threeSceneService"
import { Node, EdgeVisibility, CcState } from "../../../codeCharta.model"
import { ArrowHelper, BufferGeometry, CubicBezierCurve3, Line, LineBasicMaterial, Object3D, Vector3 } from "three"
import { ColorConverter } from "../../../util/color/colorConverter"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { IdToBuildingService } from "../../../services/idToBuilding/idToBuilding.service"
import { tap } from "rxjs"
import { hoveredNodeIdSelector } from "../../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { debounce } from "../../../util/debounce"
import { Store, State } from "@ngrx/store"
import { edgeVisibilitySelector } from "./utils/edgeVisibility.selector"

@Injectable({ providedIn: "root" })
export class CodeMapArrowService implements OnDestroy {
	private map: Map<string, Node>
	private VERTICES_PER_LINE = 5
	private arrows: Object3D[] = new Array<Object3D>()
	private HIGHLIGHT_BUILDING_DELAY = 1
	private debounceCalculation: (hoveredBuilding: CodeMapBuilding) => void = debounce(
		(hoveredBuilding: CodeMapBuilding) => this.resetEdgesOfBuildings(hoveredBuilding),
		this.HIGHLIGHT_BUILDING_DELAY
	)
	private subscription = this.store
		.select(hoveredNodeIdSelector)
		.pipe(
			tap(hoveredNodeId => {
				if (hoveredNodeId !== null) {
					const hoveredBuilding = this.idToBuildingService.get(hoveredNodeId)
					this.onBuildingHovered(hoveredBuilding)
				} else {
					this.onBuildingUnhovered()
				}
			})
		)
		.subscribe()

	constructor(
		private store: Store<CcState>,
		private state: State<CcState>,
		private threeSceneService: ThreeSceneService,
		private idToBuildingService: IdToBuildingService
	) {
		this.threeSceneService.subscribe("onBuildingSelected", this.onBuildingSelected)
		this.threeSceneService.subscribe("onBuildingDeselected", this.onBuildingDeselected)
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe()
	}

	private resetEdgesOfBuildings = (hoveredBuilding: CodeMapBuilding) => {
		if (this.isEdgeApplicableForBuilding(hoveredBuilding)) {
			this.clearArrows()
			this.showEdgesOfBuildings(hoveredBuilding)
		}
		this.scale()
	}

	onBuildingSelected = (data: { building: CodeMapBuilding }) => {
		if (this.isEdgeApplicableForBuilding(data.building)) {
			this.clearArrows()
			this.showEdgesOfBuildings()
		}
		this.scale()
	}

	onBuildingDeselected = () => {
		this.clearArrows()
		this.addEdgePreview()
	}

	onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this.debounceCalculation(hoveredBuilding)
	}

	onBuildingUnhovered() {
		const { isEdgeMetricVisible } = this.state.getValue().appSettings

		if (isEdgeMetricVisible) {
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
		const { appSettings, dynamicSettings } = this.state.getValue()
		const curveScale = 100 * appSettings.edgeHeight

		if (arrowTargetNode.attributes?.[dynamicSettings.heightMetric] && arrowOriginNode.attributes?.[dynamicSettings.heightMetric]) {
			const curve = this.createCurve(arrowOriginNode, arrowTargetNode, curveScale)
			const color = ColorConverter.getNumber(appSettings.mapColors[buildingIsOriginNode ? "outgoingEdge" : "incomingEdge"])
			this.highlightBuilding(buildingIsOriginNode ? arrowTargetNode : arrowOriginNode)
			this.setCurveColor(curve, color)
		}
	}

	addEdgePreview() {
		const edges = edgeVisibilitySelector(this.state.getValue())

		for (const edge of edges) {
			const originNode = this.map.get(edge.fromNodeName)
			const targetNode = this.map.get(edge.toNodeName)
			if (originNode && targetNode && edge.visible !== EdgeVisibility.none && edge.visible) {
				//TODO It seems originNode or targetNode might be undefined here,
				// I think it results from the method being called multiple times when it might not be available yet
				// I changed that back to avoid console errors and re-enable the edge-metric, however we should investigate why this is happening
				const curveScale = 100 * this.state.getValue().appSettings.edgeHeight
				const curve = this.createCurve(originNode, targetNode, curveScale)
				this.previewMode(curve, edge.visible)
			}
		}
	}

	addMapBasedOnNodes(nodes: Node[]) {
		this.map = this.getNodesAsMap(nodes)
	}

	scale() {
		const { scaling } = this.state.getValue().appSettings
		for (const arrow of this.arrows) {
			arrow.scale.x = scaling.x
			arrow.scale.y = scaling.y
			arrow.scale.z = scaling.z
		}
	}

	private isEdgeApplicableForBuilding(codeMapBuilding: CodeMapBuilding) {
		return this.state.getValue().appSettings.isEdgeMetricVisible && codeMapBuilding && !codeMapBuilding.node.flat
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
		const { edges } = this.state.getValue().fileSettings

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
				this.threeSceneService.highlightBuildings()
				// TODO: Check if the second if case is actually necessary. Edges should
				// always have valid origin and target paths. The test data is likely
				// faulty and should be improved.
			} else if (node.has(targetNode.path)) {
				this.addArrow(targetNode, originNode, false)
				this.threeSceneService.highlightBuildings()
			}
		}
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
		for (const node of nodes) {
			map.set(node.path, node)
		}
		return map
	}

	private makeArrowFromBezier(bezier: CubicBezierCurve3, incoming: boolean, bezierPoints = 50) {
		const points = bezier.getPoints(bezierPoints)
		const { incomingEdge, outgoingEdge } = this.state.getValue().appSettings.mapColors
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
		const direction = points.at(-1).clone().sub(points.at(-2).clone()).normalize()

		const origin = points.at(-1).clone()
		if (direction.y < 0) {
			origin.y += headLength + 1
		}
		return new ArrowHelper(direction, origin, headLength + 1, ARROW_COLOR, headLength, headWidth)
	}
}
