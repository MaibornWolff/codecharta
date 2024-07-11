import BoundingBox from "../streetLayout/boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { Vector2 } from "three"
import { TreeMapHelper } from "../treeMapLayout/treeMapHelper"

export default abstract class Treemap extends BoundingBox {
    protected treeMapNodes: CodeMapNode[] = []
    protected metricName: string

    protected constructor(rootNode: CodeMapNode) {
        super(rootNode)
    }

    abstract layout(margin: number, origin: Vector2): CodeMapNode[]

    calculateDimension(metricName: string): void {
        this.metricName = metricName
        this.metricValue = TreeMapHelper.calculateSize(this.node, metricName)
        this.width = Math.sqrt(this.metricValue)
        this.height = Math.sqrt(this.metricValue)
    }
}
