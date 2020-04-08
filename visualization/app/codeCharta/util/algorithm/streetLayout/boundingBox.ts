import { CodeMapNode } from "../../../codeCharta.model"
import Point from "../point"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"

export default abstract class BoundingBox {
	public height: number = 0
	public width: number = 0
	protected node: CodeMapNode
	protected metricValue: number

	constructor(node: CodeMapNode) {
		this.node = node
	}

	public abstract calculateDimension(metricName: string): void
	public abstract layout(origin: Point, margin: number): StreetLayoutValuedCodeMapNode[]
}
