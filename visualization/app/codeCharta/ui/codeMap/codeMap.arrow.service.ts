import * as THREE from "three"
import { Node } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { Edge, Settings } from "../../codeCharta.model"
import { Vector3 } from "three"
import { SettingsService } from "../../state/settings.service"

export class CodeMapArrowService {
	private arrows: THREE.Object3D[]

	constructor(private threeSceneService: ThreeSceneService, private settingsService: SettingsService) {
		this.arrows = new Array<THREE.Object3D>()
	}

	public clearArrows() {
		this.arrows = []
		while (this.threeSceneService.edgeArrows.children.length > 0) {
			this.threeSceneService.edgeArrows.children.pop()
		}
	}

	public addEdgeArrowsFromOrigin(origin: Node, nodes: Node[], edges: Edge[]) {
		const originPath = origin.path
		const resEdges: Edge[] = edges.filter(x => x.fromNodeName === originPath)
		this.addEdgeArrows(nodes, resEdges)
	}

	public addEdgeArrows(nodes: Node[], edges: Edge[]) {
		const map = this.getNodesAsMap(nodes)

		for (const edge of edges) {
			const originNode: Node = map.get(edge.fromNodeName)
			const targetNode: Node = map.get(edge.toNodeName)

			if (originNode && targetNode) {
				this.addArrow(targetNode, originNode)
			}
		}
	}

	public addArrow(arrowTargetNode: Node, arrowOriginNode: Node): void {
		const mapSize = this.settingsService.getSettings().treeMapSettings.mapSize
		if (
			arrowTargetNode.attributes &&
			arrowTargetNode.attributes[this.settingsService.getSettings().dynamicSettings.heightMetric] &&
			arrowOriginNode.attributes &&
			arrowOriginNode.attributes[this.settingsService.getSettings().dynamicSettings.heightMetric]
		) {
			const xTarget: number = arrowTargetNode.x0 - mapSize * 0.5
			const yTarget: number = arrowTargetNode.z0
			const zTarget: number = arrowTargetNode.y0 - mapSize * 0.5

			const wTarget: number = arrowTargetNode.width
			const hTarget: number = arrowTargetNode.height
			const lTarget: number = arrowTargetNode.length

			const xOrigin: number = arrowOriginNode.x0 - mapSize * 0.5
			const yOrigin: number = arrowOriginNode.z0
			const zOrigin: number = arrowOriginNode.y0 - mapSize * 0.5

			const wOrigin: number = arrowOriginNode.width
			const hOrigin: number = 0
			const lOrigin: number = arrowOriginNode.length

			const curve = new THREE.CubicBezierCurve3(
				new THREE.Vector3(xOrigin + wOrigin / 2, yOrigin + hOrigin, zOrigin + lOrigin / 2),
				new THREE.Vector3(
					xOrigin + wOrigin / 2,
					(Math.max(yOrigin + hOrigin, yTarget + hTarget) + mapSize) / 2,
					zOrigin + lOrigin / 2
				),
				new THREE.Vector3(xTarget + wTarget / 2, Math.max(yOrigin + hOrigin, yTarget + hTarget) + mapSize, zTarget + lTarget / 2),
				new THREE.Vector3(xTarget + wTarget / 2, yTarget + hTarget, zTarget + lTarget / 2)
			)

			const arrow: THREE.Object3D = this.makeArrowFromBezier(curve)

			this.threeSceneService.edgeArrows.add(arrow)
			this.arrows.push(arrow)
		}
	}

	public scale(scale: Vector3) {
		for (const arrow of this.arrows) {
			arrow.scale.x = scale.x
			arrow.scale.y = scale.y
			arrow.scale.z = scale.z
		}
	}

	private getNodesAsMap(nodes: Node[]): Map<string, Node> {
		const map = new Map<string, Node>()
		nodes.forEach(node => map.set(node.path, node))
		return map
	}

	private makeArrowFromBezier(
		bezier: THREE.CubicBezierCurve3,
		hex: number = 0,
		headLength: number = 10,
		headWidth: number = 10,
		bezierPoints: number = 50
	): THREE.Object3D {
		const points = bezier.getPoints(bezierPoints)

		// arrowhead
		const dir = points[points.length - 1].clone().sub(points[points.length - 2].clone())
		dir.normalize()
		const origin = points[points.length - 1].clone()
		const arrowHelper = new THREE.ArrowHelper(dir, origin, 0, hex, headLength, headWidth)

		// curve
		const geometry = new THREE.BufferGeometry()
		geometry.setFromPoints(points)
		const material = new THREE.LineBasicMaterial({ color: hex, linewidth: 1 })
		const curveObject = new THREE.Line(geometry, material)

		//combine
		curveObject.add(arrowHelper)
		return curveObject
	}
}
