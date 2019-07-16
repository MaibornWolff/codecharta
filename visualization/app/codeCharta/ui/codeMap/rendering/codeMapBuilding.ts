import { Node } from "../../../codeCharta.model"
import { Box3, Vector3 } from "three"
import { ColorConverter } from "../../../util/colorConverter"
import convert from "color-convert"

export class CodeMapBuilding {
	private readonly _id: number
	private _boundingBox: Box3
	private _color: string
	private _defaultColor: string
	private _node: Node
	public parent: CodeMapBuilding

	constructor(id: number, box: Box3, node: Node, color: string) {
		this._id = id
		this._boundingBox = box
		this._color = color
		this._defaultColor = color
		this._node = node
	}

	public getCenterPoint(mapSize: number): Vector3 {
		return new Vector3(
			this._node.x0 - mapSize * 0.5 + this._node.width / 2,
			this._node.z0 + this._node.height,
			this._node.y0 - mapSize * 0.5 + this._node.length / 2
		)
	}

	public decreaseLightness(value: number) {
		const hsl = convert.hex.hsl(this._defaultColor)
		hsl[2] -= value
		hsl[2] = hsl[2] < 10 ? 10 : hsl[2]
		this._color = ColorConverter.convertNumberToHex(convert.hsl.hex([hsl[0], hsl[1], hsl[2]]))
	}

	public getColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this._color)
	}

	public getDefaultColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this._defaultColor)
	}

	public resetColor() {
		this._color = this._defaultColor
	}

	public equals(building: CodeMapBuilding) {
		return this._id === building._id
	}

	public get id(): number {
		return this._id
	}

	public get boundingBox(): Box3 {
		return this._boundingBox
	}

	public get color(): string {
		return this._color
	}

	public get node(): Node {
		return this._node
	}

	public setColor(color: string) {
		this._color = color
	}

	public setNode(node: Node) {
		this._node = node
	}
}
