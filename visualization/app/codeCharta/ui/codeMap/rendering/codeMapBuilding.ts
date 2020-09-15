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
	parent: CodeMapBuilding

	constructor(id: number, box: Box3, node: Node, color: string) {
		this._id = id
		this._boundingBox = box
		this._color = color
		this._defaultColor = color
		this._deltaColor = "#000000"
		this._defaultDeltaColor = "#000000"
		this._node = node
	}

	getCenterPoint(mapSize: number) {
		return new Vector3(
			this._node.x0 - mapSize + this._node.width / 2,
			this._node.z0 + this._node.height,
			this._node.y0 - mapSize + this._node.length / 2
		)
	}

	decreaseLightness(value: number) {
		const defaultColorHSL = ColorConverter.hexToHSL(this._defaultColor)
		defaultColorHSL.decreaseLightness(value)
		if (defaultColorHSL.getLightness() < 10) {
			defaultColorHSL.setLightness(10)
		} else {
			defaultColorHSL.setLightness(defaultColorHSL.getLightness())
		}
		this._color = defaultColorHSL.toHex()

		if (this._node.deltas) {
			const deltaColorHSL = ColorConverter.hexToHSL(this._defaultDeltaColor)
			deltaColorHSL.decreaseLightness(value)
			if (deltaColorHSL.getLightness() < 10) {
				deltaColorHSL.setLightness(10)
			} else {
				deltaColorHSL.setLightness(deltaColorHSL.getLightness())
			}
			this._deltaColor = deltaColorHSL.toHex()
		}
	}

	getColorVector() {
		return ColorConverter.getVector3(this._color)
	}

	getDefaultColorVector() {
		return ColorConverter.getVector3(this._defaultColor)
	}

	getDeltaColorVector() {
		return ColorConverter.getVector3(this._deltaColor)
	}

	getDefaultDeltaColorVector() {
		return ColorConverter.getVector3(this._defaultDeltaColor)
	}

	resetColor() {
		this._color = this._defaultColor
		this._deltaColor = this._defaultDeltaColor
	}

	equals(building: CodeMapBuilding) {
		return this._id === building._id
	}

	get id() {
		return this._id
	}

	get boundingBox() {
		return this._boundingBox
	}

	get color() {
		return this._color
	}

	get node() {
		return this._node
	}

	get deltaColor() {
		return this._deltaColor
	}

	get defaultDeltaColor() {
		return this._defaultDeltaColor
	}

	setColor(color: string) {
		this._color = color
	}

	setNode(node: Node) {
		this._node = node
	}

	setDeltaColor(color: string) {
		this._defaultDeltaColor = color
		this._deltaColor = color
	}
}
