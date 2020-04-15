import BoundingBox from "./boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Point from "../point"
import Rectangle from "../rectangle"
import { StreetLayoutHelper } from "../../streetLayoutHelper"

export default class House extends BoundingBox {
	private FIXED_MARGIN = 0.5

	constructor(node: CodeMapNode) {
		super(node)
	}

	public calculateDimension(metricName: string): void {
		this.metricValue = StreetLayoutHelper.calculateSize(this.node, metricName)
		this.width = Math.sqrt(this.metricValue)
		this.height = Math.sqrt(this.metricValue)
	}

	public layout(origin: Point): StreetLayoutValuedCodeMapNode[] {
		const layoutNode: StreetLayoutValuedCodeMapNode = {
			data: this.node,
			value: this.metricValue,
			rect: this.createMarginatedRectangle(origin),
			zOffset: 0
		}
		return [layoutNode]
	}

	private createMarginatedRectangle(origin: Point) {
		const newOrigin = new Point(origin.x + this.FIXED_MARGIN, origin.y + this.FIXED_MARGIN)
		const width = this.width - 2 * this.FIXED_MARGIN
		const height = this.height - 2 * this.FIXED_MARGIN
		return new Rectangle(newOrigin, width, height)
	}
}
