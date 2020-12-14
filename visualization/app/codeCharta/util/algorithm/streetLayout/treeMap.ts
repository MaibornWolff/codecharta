import BoundingBox from "../streetLayout/boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { Vector2 } from "three"
import { TreeMapHelper } from "../treeMapLayout/treeMapHelper"

export default abstract class Treemap extends BoundingBox {
	protected treeMapNodes: CodeMapNode[] = []
	protected metricName: string

	constructor(rootNode: CodeMapNode) {
		super(rootNode)
	}

	public abstract layout(origin: Vector2, margin: number): CodeMapNode[]

	calculateDimension(metricName: string): void {
		this.metricName = metricName
		this.metricValue = TreeMapHelper.calculateSize(this.node, metricName)
		this.width = Math.sqrt(this.metricValue)
		this.height = Math.sqrt(this.metricValue)
	}
}
