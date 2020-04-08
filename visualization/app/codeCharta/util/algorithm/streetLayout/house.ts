import BoundingBox from "./boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Point from "../point"
import Rectangle from "../rectangle"
import { StreetLayoutHelper } from "../../streetLayoutHelper"

export default class House extends BoundingBox {
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
			rect: new Rectangle(new Point(origin.x, origin.y), this.width, this.height),
			zOffset: 0
		}
		return [layoutNode]
	}
}
