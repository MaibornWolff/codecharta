import { Vector2 } from "three"
import { CodeMapNode } from "../../../../model/codeCharta.model"
import BoundingBox from "./boundingBox"
import { StreetViewHelper } from "./streetViewHelper"

export default class House extends BoundingBox {
    constructor(node: CodeMapNode) {
        super(node)
    }

    calculateDimension(metricName: string): void {
        this.metricValue = StreetViewHelper.calculateSize(this.mapNode, metricName)
        const size = Math.sqrt(this.metricValue)
        this.width = this.height = size
    }

    layout(_, origin: Vector2): CodeMapNode[] {
        const layoutNode: CodeMapNode = {
            ...this.mapNode,
            value: this.metricValue,
            rect: this.createMarginatedRectangle(origin),
            zOffset: 0
        }
        return [layoutNode]
    }
}
