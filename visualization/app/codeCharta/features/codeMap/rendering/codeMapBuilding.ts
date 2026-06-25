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

    private _highlightedColorVector: Vector3
    private _dimmedColorVector: Vector3
    private _highlightedDeltaColorVector: Vector3
    private _dimmedDeltaColorVector: Vector3

    constructor(id: number, box: Box3, node: Node, color: string) {
        this._id = id
        this._boundingBox = box
        this._color = color
        this._defaultColor = color
        this._deltaColor = "#000000"
        this._defaultDeltaColor = "#000000"
        this._node = node
        if (color) {
            this._computeCachedColorVectors()
        }
    }

    private _computeCachedColorVectors() {
        this._highlightedColorVector = this._computeColorVector(this._defaultColor, -10)
        this._dimmedColorVector = this._computeColorVector(this._defaultColor, 20)
        this._highlightedDeltaColorVector = this._computeColorVector(this._defaultDeltaColor, -10)
        this._dimmedDeltaColorVector = this._computeColorVector(this._defaultDeltaColor, 20)
    }

    private _computeColorVector(color: string, lightnessChange: number): Vector3 {
        const hex = this._decreaseLightnessForColor(color, lightnessChange)
        return ColorConverter.getVector3(hex)
    }

    getCenterPoint(mapSize: number) {
        return new Vector3(
            this._node.x0 - mapSize + this._node.width / 2,
            this._node.z0 + this._node.height,
            this._node.y0 - mapSize + this._node.length / 2
        )
    }

    decreaseLightness(value: number) {
        this._color = this._decreaseLightnessForColor(this._defaultColor, value)

        if (this._node.deltas) {
            this._deltaColor = this._decreaseLightnessForColor(this._defaultDeltaColor, value)
        }
    }

    private _decreaseLightnessForColor(color: string, value: number) {
        const colorHSL = ColorConverter.hexToHSL(color)
        colorHSL.decreaseLightness(value)
        if (colorHSL.getLightness() < 10) {
            colorHSL.setLightness(10)
        } else {
            colorHSL.setLightness(colorHSL.getLightness())
        }
        return colorHSL.toHex()
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

    getHighlightedColorVector() {
        return this._highlightedColorVector
    }

    getDimmedColorVector() {
        return this._dimmedColorVector
    }

    getHighlightedDeltaColorVector() {
        return this._highlightedDeltaColorVector
    }

    getDimmedDeltaColorVector() {
        return this._dimmedDeltaColorVector
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

    setInitialDeltaColor(color: string) {
        this._defaultDeltaColor = color
        this._deltaColor = color
        this._highlightedDeltaColorVector = this._computeColorVector(color, -10)
        this._dimmedDeltaColorVector = this._computeColorVector(color, 20)
    }

    setDeltaColor(color: string) {
        this._deltaColor = color
    }
}
