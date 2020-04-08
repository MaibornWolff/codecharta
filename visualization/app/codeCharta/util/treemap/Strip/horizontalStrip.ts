import Strip from "./Strip"
import { CodeMapNode } from "../../../codeCharta.model"
import Rectangle from "../../rectangle"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Point from "../../point"

export enum HorizontalOrder {
	leftToRight,
	rightToLeft
}

export default class HorizontalStrip extends Strip {
	constructor(nodes: CodeMapNode[]) {
		super(nodes)
	}

	public layout(
		rect: Rectangle,
		rootSize: number,
		metricName: string,
		currentTreemapDepth: number,
		order: HorizontalOrder = HorizontalOrder.leftToRight
	): StreetLayoutValuedCodeMapNode[] {
		let offsetX = rect.topLeft.x

		const nodes = order === HorizontalOrder.leftToRight ? this.nodes : this.nodes.reverse()
		const rootArea = rect.area()
		const width = rect.width
		const height = this.totalScaledSize(nodes, metricName, rootSize, rootArea) / width
		const stripNodes: StreetLayoutValuedCodeMapNode[] = []

		for (const node of nodes) {
			const nodeSize = this.scaledSize(node, rootSize, rootArea, metricName)
			const nodeWidth = height > 0 ? nodeSize / height : 0
			const newRect = new Rectangle(new Point(offsetX, rect.topLeft.y), nodeWidth, height)
			stripNodes.push({
				data: node,
				value: node.type === "File" ? rootSize : 0,
				rect: newRect,
				zOffset: currentTreemapDepth
			})
			offsetX += nodeWidth
		}
		return stripNodes
	}

	public worstAspectRatio(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, metricName: string): number {
		const width = rect.width
		const rootArea = rect.area()
		const totalSize = this.totalScaledSize(nodes, metricName, rootSize, rootArea)
		const stripMin = this.min(nodes, metricName, rootSize, rootArea)
		const stripMax = this.max(nodes, metricName, rootSize, rootArea)
		const widthSquared = Math.pow(width, 2)
		const totalSizeSquared = Math.pow(totalSize, 2)

		return Math.max((widthSquared * stripMax) / totalSizeSquared, totalSizeSquared / (widthSquared * stripMin))
	}
}
