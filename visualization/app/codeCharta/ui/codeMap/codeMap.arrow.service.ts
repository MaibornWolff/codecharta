import * as THREE from "three"
import { Node } from "../../codeCharta.model"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { Edge, Settings } from "../../codeCharta.model"

export class CodeMapArrowService {
	private arrows: THREE.Object3D[]

	constructor(private threeSceneService: ThreeSceneService) {
		this.arrows = new Array<THREE.Object3D>()
	}

	public clearArrows() {
		this.arrows = []
		while (this.threeSceneService.edgeArrows.children.length > 0) {
			this.threeSceneService.edgeArrows.children.pop()
		}
	}

	public addEdgeArrowsFromOrigin(origin: Node, nodes: Node[], deps: Edge[], settings: Settings) {
		let resEdges: Edge[] = []
		let originPath = this.getPathFromNode(origin)
		for (let dep of deps) {
			if (dep.fromNodeName === originPath) {
				resEdges.push(dep)
			}
		}
		this.addEdgeArrows(nodes, resEdges, settings)
	}

	public addEdgeArrows(nodes: Node[], edges: Edge[], settings: Settings) {
		let map = this.getNodepathMap(nodes)

		for (let edge of edges) {
			let originNode: Node = map.get(edge.fromNodeName)
			let targetNode: Node = map.get(edge.toNodeName)

			if (originNode && targetNode) {
				this.addArrow(targetNode, originNode, settings)
			}
		}
	}

	public addArrow(arrowTargetNode: Node, arrowOriginNode: Node, s: Settings): void {
		if (
			arrowTargetNode.attributes &&
			arrowTargetNode.attributes[s.dynamicSettings.heightMetric] &&
			arrowOriginNode.attributes &&
			arrowOriginNode.attributes[s.dynamicSettings.heightMetric]
		) {
			let xTarget: number = arrowTargetNode.x0 - s.treeMapSettings.mapSize * 0.5
			let yTarget: number = arrowTargetNode.z0
			let zTarget: number = arrowTargetNode.y0 - s.treeMapSettings.mapSize * 0.5

			let wTarget: number = arrowTargetNode.width
			let hTarget: number = arrowTargetNode.height
			let lTarget: number = arrowTargetNode.length

			let xOrigin: number = arrowOriginNode.x0 - s.treeMapSettings.mapSize * 0.5
			let yOrigin: number = arrowOriginNode.z0
			let zOrigin: number = arrowOriginNode.y0 - s.treeMapSettings.mapSize * 0.5

			let wOrigin: number = arrowOriginNode.width
			let hOrigin: number = arrowOriginNode.height
			let lOrigin: number = arrowOriginNode.length

			let curve = new THREE.CubicBezierCurve3(
				new THREE.Vector3(xOrigin + wOrigin / 2, yOrigin + hOrigin, zOrigin + lOrigin / 2),
				new THREE.Vector3(
					xOrigin + wOrigin / 2,
					Math.max(yOrigin + hOrigin, yTarget + hTarget) + s.treeMapSettings.mapSize,
					zOrigin + lOrigin / 2
				),
				new THREE.Vector3(
					xTarget + wTarget / 2,
					Math.max(yOrigin + hOrigin, yTarget + hTarget) + s.treeMapSettings.mapSize,
					zTarget + lTarget / 2
				),
				new THREE.Vector3(xTarget + wTarget / 2, yTarget + hTarget, zTarget + lTarget / 2)
			)

			let arrow: THREE.Object3D = this.makeArrowFromBezier(curve)

			this.threeSceneService.edgeArrows.add(arrow)
			this.arrows.push(arrow)
		}
	}

	public scale(x: number, y: number, z: number) {
		for (let arrow of this.arrows) {
			arrow.scale.x = x
			arrow.scale.y = y
			arrow.scale.z = z
		}
	}

	private getNodepathMap(nodes: Node[]): Map<string, Node> {
		let map = new Map<string, Node>()

		for (let node of nodes) {
			map.set(this.getPathFromNode(node), node)
		}

		return map
	}

	private getPathFromNode(node: Node): string {
		let current: Node = node
		let path = ""
		while (current) {
			path = "/" + current.name + path
			current = current.parent
		}
		return path
	}

	private makeArrowFromBezier(
		bezier: THREE.CubicBezierCurve3,
		hex: number = 0,
		headLength: number = 10,
		headWidth: number = 10,
		bezierPoints: number = 50
	): THREE.Object3D {
		let points = bezier.getPoints(bezierPoints)

		// arrowhead
		let dir = points[points.length - 1].clone().sub(points[points.length - 2].clone())
		dir.normalize()
		let origin = points[points.length - 1].clone()
		let arrowHelper = new THREE.ArrowHelper(dir, origin, 0, hex, headLength, headWidth)

		// curve
		let geometry = new THREE.BufferGeometry()
		geometry.setFromPoints(points)
		let material = new THREE.LineBasicMaterial({ color: hex, linewidth: 1 })
		let curveObject = new THREE.Line(geometry, material)

		//combine
		curveObject.add(arrowHelper)
		return curveObject
	}
}
