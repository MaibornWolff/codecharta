import SquarifiedTreemap from "./squarifiedTreeMap"
import { CodeMapNode } from "../../../codeCharta.model"
import Rectangle from "../rectangle"
import Point from "../point"
import HorizontalStrip, { HorizontalOrder } from "./strip/horizontalStrip"
import Strip from "./strip/strip"

export default class StripTreemap extends SquarifiedTreemap {
	constructor(rootNode: CodeMapNode) {
		super(rootNode)
	}

	protected createNodes(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, currentTreemapDepth: number, margin: number): void {
		let processed = 0
		let currentRect = new Rectangle(new Point(rect.topLeft.x, rect.topLeft.y), rect.width, rect.height)
		let currentRootSize = rootSize
		let order = HorizontalOrder.leftToRight

		do {
			const currentStrip = this.createStrip(currentRect, nodes.slice(processed), currentRootSize)
			const stripSize = currentStrip.totalSize(this.metricName)
			if (stripSize > 0) {
				const stripNodes = this.createStripNodes(currentStrip, currentRect, currentRootSize, currentTreemapDepth, margin)
				this.createChildrenNodes(stripNodes, currentTreemapDepth, margin)
				currentRect = this.remainingRectangle(currentRect, currentStrip, currentRootSize, currentRect.area())
				currentRootSize -= stripSize
			}
			order = 1 - order
			processed += currentStrip.nodes.length
		} while (processed < nodes.length) /* as long as there are children to process */
	}

	protected createStrip(rect: Rectangle, nodes: CodeMapNode[], rootSize: number): Strip {
		const currentStrip = new HorizontalStrip([nodes[0]])
		currentStrip.populate(nodes.slice(1), rect, rootSize, this.metricName)
		return currentStrip
	}
}
