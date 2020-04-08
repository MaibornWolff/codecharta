import Treemap from "./treemap"
import { CodeMapNode } from "../../../codeCharta.model"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Point from "../point"
import Rectangle from "../rectangle"
import { StreetLayoutHelper } from "../../streetLayoutHelper"

export default class SliceDiceTreemap extends Treemap {
	protected treemapNodes: StreetLayoutValuedCodeMapNode[] = []

	constructor(rootNode: CodeMapNode) {
		super(rootNode)
	}

	public layout(origin: Point, margin: number): StreetLayoutValuedCodeMapNode[] {
		const rect = new Rectangle(origin, this.width, this.height)
		let topLeft: [number, number] = [rect.topLeft.x, rect.topLeft.y]
		let bottomRight: [number, number] = [rect.topLeft.x + rect.width, rect.topLeft.y + rect.height]
		this.sliceAndDice(this.node, topLeft, bottomRight, 0, margin)
		return this.treemapNodes
	}

	private sliceAndDice(
		rootNode: CodeMapNode,
		topLeft: [number, number],
		bottomRight: [number, number],
		currentTreemapDepth: number,
		margin: number
	): void {
		let newTopLeft: [number, number] = [topLeft[0], topLeft[1]]
		let newBottomRight: [number, number] = [bottomRight[0], bottomRight[1]]

		const axis = this.getAxis(currentTreemapDepth)
		const newOrigin = new Point(topLeft[0], topLeft[1])
		const newWidth = bottomRight[0] - topLeft[0]
		const newHeight = bottomRight[1] - topLeft[1]
		const newRect = new Rectangle(newOrigin, newWidth, newHeight)
		this.treemapNodes.push({
			data: rootNode,
			value: rootNode.type === "File" ? StreetLayoutHelper.calculateSize(this.node, this.metricName) : 0,
			rect: newRect,
			zOffset: currentTreemapDepth
		})

		//uses x or y coord depending on orientation of the rectangle
		const width = bottomRight[axis] - topLeft[axis]

		for (const child of rootNode.children) {
			const rootSize = StreetLayoutHelper.calculateSize(rootNode, this.metricName)
			const childSize = StreetLayoutHelper.calculateSize(child, this.metricName)

			if (rootSize !== 0) {
				//sets position of new rectangle
				newBottomRight[axis] = newTopLeft[axis] + (childSize / rootSize) * width
				//go to child level and toggle axis
				this.sliceAndDice(child, newTopLeft, newBottomRight, currentTreemapDepth + 1, margin)
				newTopLeft[axis] = newBottomRight[axis]
			}
		}
	}

	private getAxis(depth: number) {
		return depth % 2 === 0 ? 0 : 1
	}
}
