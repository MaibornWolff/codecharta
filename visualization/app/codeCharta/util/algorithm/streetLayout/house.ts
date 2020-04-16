import BoundingBox from "./boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Point from "../point"
import { LayoutHelper } from "../../layoutHelper"

export default class House extends BoundingBox {
	constructor(node: CodeMapNode) {
		super(node)
	}

	public calculateDimension(metricName: string): void {
		this.metricValue = LayoutHelper.calculateSize(this.node, metricName)
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
}
