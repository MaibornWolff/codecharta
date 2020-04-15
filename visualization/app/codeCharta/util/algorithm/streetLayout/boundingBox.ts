import { CodeMapNode } from "../../../codeCharta.model"
import Point from "../point"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Rectangle from "../rectangle"

export default abstract class BoundingBox {
	public height: number = 0
	public width: number = 0
	protected node: CodeMapNode
	protected metricValue: number
	protected FIXED_MARGIN = 0.5

	constructor(node: CodeMapNode) {
		this.node = node
	}

	public abstract calculateDimension(metricName: string): void
	public abstract layout(origin: Point, margin: number): StreetLayoutValuedCodeMapNode[]

	protected createMarginatedRectangle(origin: Point) {
		const newOrigin = new Point(origin.x + this.FIXED_MARGIN, origin.y + this.FIXED_MARGIN)
		const width = this.width - 2 * this.FIXED_MARGIN
		const height = this.height - 2 * this.FIXED_MARGIN
		return new Rectangle(newOrigin, width, height)
	}
}
