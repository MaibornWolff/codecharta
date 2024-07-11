import { Vector2 } from "three"
import { CodeMapNode } from "../../../codeCharta.model"
import Rectangle from "./rectangle"

export default abstract class BoundingBox {
    height = 0
    width = 0
    node: CodeMapNode
    protected metricValue: number
    protected FIXED_MARGIN = 0.5

    constructor(node: CodeMapNode) {
        this.node = node
    }

    getNode() {
        return this.node
    }

    abstract calculateDimension(metricName: string): void
    abstract layout(margin: number, origin: Vector2): CodeMapNode[]

    protected createMarginatedRectangle(origin: Vector2) {
        const newOrigin = new Vector2(origin.x + this.FIXED_MARGIN, origin.y + this.FIXED_MARGIN)
        const width = this.width - 2 * this.FIXED_MARGIN
        const height = this.height - 2 * this.FIXED_MARGIN
        return new Rectangle(newOrigin, width, height)
    }
}
