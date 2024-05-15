import BoundingBox from "./boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { Vector2 } from "three"
import { StreetViewHelper } from "./streetViewHelper"

export default class House extends BoundingBox {
    constructor(node: CodeMapNode) {
        super(node)
    }

    calculateDimension(metricName: string): void {
        this.metricValue = StreetViewHelper.calculateSize(this.node, metricName)
        const size = Math.sqrt(this.metricValue)
        this.width = this.height = size
    }

    layout(_, origin: Vector2): CodeMapNode[] {
        const layoutNode: CodeMapNode = {
            ...this.node,
            value: this.metricValue,
            rect: this.createMarginatedRectangle(origin),
            zOffset: 0
        }
        return [layoutNode]
    }
}
