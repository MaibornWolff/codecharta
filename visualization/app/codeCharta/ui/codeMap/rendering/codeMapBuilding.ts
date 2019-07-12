import { Node } from "../../../codeCharta.model"
import { Box3, Vector3 } from "three"
import { ColorConverter } from "../../../util/colorConverter"
import convert from "color-convert"

export class CodeMapBuilding {
	public id: number
	public boundingBox: Box3
	public color: string
	public defaultColor: string
	public node: Node
	public parent?: CodeMapBuilding
	public name?: string

	constructor(id: number, box: Box3, node: Node, color: string) {
		this.id = id
		this.boundingBox = box
		this.color = color
		this.defaultColor = color
		this.node = node
	}

	public getCenterPoint(mapSize: number): Vector3 {
		return new Vector3(
			this.node.x0 - mapSize * 0.5 + this.node.width / 2,
			this.node.z0 + this.node.height,
			this.node.y0 - mapSize * 0.5 + this.node.length / 2
		)
	}

	public decreaseLightness(value: number) {
		const hsl = convert.hex.hsl(this.defaultColor)
		hsl[2] -= value
		hsl[2] = hsl[2] < 10 ? 10 : hsl[2]
		this.color = ColorConverter.convertNumberToHex(convert.hsl.hex([hsl[0], hsl[1], hsl[2]]))
	}

	public getColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this.color)
	}

	public getDefaultColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this.defaultColor)
	}
}
