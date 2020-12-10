import BoundingBox, { StreetLayoutValuedCodeMapNode } from "./boundingBox"
import { CodeMapNode } from "../../../codeCharta.model"
import { Vector2 } from "three"
import { StreetViewHelper } from "./streetViewHelper"

export default class House extends BoundingBox {
	constructor(node: CodeMapNode) {
		super(node)
	}

	public calculateDimension(metricName: string): void {
		this.metricValue = StreetViewHelper.calculateSize(this.node, metricName)
		this.width = Math.sqrt(this.metricValue)
		this.height = Math.sqrt(this.metricValue)
	}

	public layout(origin: Vector2): StreetLayoutValuedCodeMapNode[] {
		const layoutNode: StreetLayoutValuedCodeMapNode = {
			data: this.node,
			value: this.metricValue,
			rect: this.createMarginatedRectangle(origin),
			zOffset: 0
		}
		return [layoutNode]
	}
}
