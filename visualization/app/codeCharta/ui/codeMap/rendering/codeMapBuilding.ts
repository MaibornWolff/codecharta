import { Node } from "../../../codeCharta.model"
import { Box3, Vector3 } from "three"
import { ColorConverter } from "../../../util/color/colorConverter"

export class CodeMapBuilding {
	private readonly _id: number
	private _boundingBox: Box3
	private _color: string
	private _defaultColor: string
	private _deltaColor: string
	private _defaultDeltaColor: string
	private _node: Node
	public parent: CodeMapBuilding

	constructor(id: number, box: Box3, node: Node, color: string) {
		this._id = id
		this._boundingBox = box
		this._color = color
		this._defaultColor = color
		this._deltaColor = "#000000"
		this._defaultDeltaColor = "#000000"
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
		const defaultColorHSL = ColorConverter.hexToHSL(this._defaultColor)
		defaultColorHSL.decreaseLightness(value)
		defaultColorHSL.getLightness() < 10
			? defaultColorHSL.setLightness(10)
			: defaultColorHSL.setLightness(defaultColorHSL.getLightness())
		this._color = defaultColorHSL.toHex()

		if (this._node.deltas) {
			const deltaColorHSL = ColorConverter.hexToHSL(this._defaultDeltaColor)
			deltaColorHSL.decreaseLightness(value)
			deltaColorHSL.getLightness() < 10 ? deltaColorHSL.setLightness(10) : deltaColorHSL.setLightness(deltaColorHSL.getLightness())
			this._deltaColor = deltaColorHSL.toHex()
		}
	}

	public getColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this._color)
	}

	public getDefaultColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this._defaultColor)
	}

	public getDeltaColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this._deltaColor)
	}

	public getDefaultDeltaColorVector(): Vector3 {
		return ColorConverter.colorToVector3(this._defaultDeltaColor)
	}

	public resetColor() {
		this._color = this._defaultColor
		this._deltaColor = this._defaultDeltaColor
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

	public get deltaColor(): string {
		return this._deltaColor
	}

	public get defaultDeltaColor(): string {
		return this._defaultDeltaColor
	}

	public setColor(color: string) {
		this._color = color
	}

	public setNode(node: Node) {
		this._node = node
	}

	public setDeltaColor(color: string) {
		this._defaultDeltaColor = color
		this._deltaColor = color
	}
}
