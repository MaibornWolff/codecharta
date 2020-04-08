import Strip from "./Strip"
import { CodeMapNode } from "../../../codeCharta.model"
import Rectangle from "../../rectangle"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Point from "../../point"

export enum VerticalOrder {
	topToBottom,
	bottomToTop
}

export default class VerticalStrip extends Strip {
	constructor(nodes: CodeMapNode[]) {
		super(nodes)
	}

	public layout(
		rect: Rectangle,
		rootSize: number,
		metricName: string,
		currentTreemapDepth: number,
		order: VerticalOrder = VerticalOrder.topToBottom
	): StreetLayoutValuedCodeMapNode[] {
		let offsetY = rect.topLeft.y

		const nodes = order === VerticalOrder.topToBottom ? this.nodes : this.nodes.reverse()
		const rootArea = rect.area()
		const height = rect.height
		const width = this.totalScaledSize(nodes, metricName, rootSize, rootArea) / height
		const stripNodes: StreetLayoutValuedCodeMapNode[] = []

		for (const node of nodes) {
			const nodeSize = this.scaledSize(node, rootSize, rootArea, metricName)
			const nodeHeight = width > 0 ? nodeSize / width : 0
			const newRect = new Rectangle(new Point(rect.topLeft.x, offsetY), width, nodeHeight)
			stripNodes.push({
				data: node,
				value: node.type === "File" ? rootSize : 0,
				rect: newRect,
				zOffset: currentTreemapDepth
			})
			offsetY += nodeHeight
		}
		return stripNodes
	}

	public worstAspectRatio(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, metricName: string): number {
		const height = rect.height
		const rootArea = rect.area()
		const totalSize = this.totalScaledSize(nodes, metricName, rootSize, rootArea)
		const stripMin = this.min(nodes, metricName, rootSize, rootArea)
		const stripMax = this.max(nodes, metricName, rootSize, rootArea)
		const heightSquared = Math.pow(height, 2)
		const totalSizeSquared = Math.pow(totalSize, 2)

		return Math.max((heightSquared * stripMax) / totalSizeSquared, totalSizeSquared / (heightSquared * stripMin))
	}
}
