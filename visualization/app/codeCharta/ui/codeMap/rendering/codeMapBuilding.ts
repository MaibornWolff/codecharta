import * as THREE from "three"
import { Node } from "../../../codeCharta.model"

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
}
