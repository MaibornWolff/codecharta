import BoundingBox from "../streetLayout/boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Point from "../point"
import { StreetLayoutHelper } from "../../streetLayoutHelper"

export default abstract class Treemap extends BoundingBox {
	protected treeMapNodes: StreetLayoutValuedCodeMapNode[] = []
	protected metricName: string

	constructor(rootNode: CodeMapNode) {
		super(rootNode)
	}

	public abstract layout(origin: Point, margin: number): StreetLayoutValuedCodeMapNode[]

	public calculateDimension(metricName: string): void {
		this.metricName = metricName
		this.metricValue = StreetLayoutHelper.calculateSize(this.node, metricName)
		this.width = Math.sqrt(this.metricValue)
		this.height = Math.sqrt(this.metricValue)
	}
}
