import * as THREE from "three"
import { Node } from "../../../codeCharta.model"
import { Vector3 } from "three"

export class CodeMapBuilding {
	public id: number
	public boundingBox: THREE.Box3
	public color: string
	public node: Node
	public parent?: CodeMapBuilding
	public name?: string

	constructor(id: number, box: THREE.Box3, node: Node, color: string) {
		this.id = id
		this.boundingBox = box
		this.color = color
		this.node = node
	}

	public getCenterOfBuilding(mapSize: number) {
		return new Vector3(
			this.node.x0 - mapSize * 0.5 + this.node.width / 2,
			this.node.z0 + this.node.height,
			this.node.y0 - mapSize * 0.5 + this.node.length / 2
		)
	}
}
