import Treemap from "./treeMap"
import { CodeMapNode } from "../../../codeCharta.model"
import Point from "../point"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import Rectangle from "../rectangle"
import { StreetLayoutHelper } from "../../streetLayoutHelper"
import HorizontalStrip from "./strip/horizontalStrip"
import VerticalStrip from "./strip/verticalStrip"
import Strip from "./strip/strip"

export default class SquarifiedTreemap extends Treemap {
	constructor(rootNode: CodeMapNode) {
		super(rootNode)
	}

	public layout(origin: Point = new Point(0, 0), margin: number): StreetLayoutValuedCodeMapNode[] {
		const rectangle = this.createMarginatedRectangle(origin)
		const rootNode: StreetLayoutValuedCodeMapNode = {
			data: this.node,
			value: this.metricValue,
			rect: rectangle,
			zOffset: 0
		}
		const children = this.node.children.filter(child => StreetLayoutHelper.calculateSize(child, this.metricName) > 0)

		this.treeMapNodes.push(rootNode)

		if (children.length === 0) {
			return this.treeMapNodes
		}
		this.createNodes(children, rectangle, this.metricValue, 1, margin)

		return this.treeMapNodes
	}

	protected createNodes(nodes: CodeMapNode[], rect: Rectangle, rootSize: number, currentTreemapDepth: number, margin: number): void {
		let processedNodesCount = 0
		let currentRect = new Rectangle(new Point(rect.topLeft.x, rect.topLeft.y), rect.width, rect.height)
		let currentRootSize = rootSize
		let orderedNodes = this.orderBySizeDescending(nodes)

		do {
			const currentStrip = this.createStrip(currentRect, orderedNodes.slice(processedNodesCount), currentRootSize)
			const stripSize = currentStrip.totalSize(this.metricName)

			if (stripSize > 0) {
				const stripNodes = this.createStripNodes(currentStrip, currentRect, currentRootSize, currentTreemapDepth, margin)
				this.createChildrenNodes(stripNodes, currentTreemapDepth, margin)
				currentRect = this.remainingRectangle(currentRect, currentStrip, currentRootSize, currentRect.area())
				currentRootSize -= stripSize
			}
			processedNodesCount += currentStrip.nodes.length
		} while (processedNodesCount < orderedNodes.length) /* as long as there are children to process */
	}

	protected createStrip(rect: Rectangle, nodes: CodeMapNode[], rootSize: number): Strip {
		const firstNode = nodes[0]
		const currentStrip = rect.isVertical() ? new HorizontalStrip([firstNode]) : new VerticalStrip([firstNode])

		currentStrip.populate(nodes.slice(1), rect, rootSize, this.metricName)

		return currentStrip
	}

	protected remainingRectangle(rect: Rectangle, strip: Strip, parentSize: number, parentArea: number): Rectangle {
		const stripSize = strip.totalScaledSize(strip.nodes, this.metricName, parentSize, parentArea)

		let newOrigin: Point
		let width = rect.width
		let height = rect.height

		if (strip instanceof HorizontalStrip) {
			const stripHeight = stripSize / rect.width
			height -= stripHeight
			newOrigin = new Point(rect.topLeft.x, rect.topLeft.y + stripHeight)
		} else {
			const stripWidth = stripSize / rect.height
			width -= stripWidth
			newOrigin = new Point(rect.topLeft.x + stripWidth, rect.topLeft.y)
		}
		return new Rectangle(newOrigin, width, height)
	}

	protected createStripNodes(
		strip: Strip,
		rect: Rectangle,
		rootSize: number,
		currentTreemapDepth: number,
		margin: number,
		order?: number
	): StreetLayoutValuedCodeMapNode[] {
		const stripNodes = strip.layout(rect, rootSize, this.metricName, currentTreemapDepth, margin, order)
		this.treeMapNodes.push(...stripNodes)
		return stripNodes
	}

	protected createChildrenNodes(stripNodes: StreetLayoutValuedCodeMapNode[], currentTreemapDepth: number, margin: number): void {
		for (let node of stripNodes) {
			if (node.data.children && node.data.children.length > 0) {
				const children = node.data.children.filter(child => StreetLayoutHelper.calculateSize(child, this.metricName) > 0)
				if (children.length > 0) {
					const size = StreetLayoutHelper.calculateSize(node.data, this.metricName)
					this.createNodes(children, node.rect, size, currentTreemapDepth + 1, margin)
				}
			}
		}
	}

	private orderBySizeDescending(nodes: CodeMapNode[]): CodeMapNode[] {
		return nodes.sort((a, b) => {
			return StreetLayoutHelper.calculateSize(b, this.metricName) - StreetLayoutHelper.calculateSize(a, this.metricName)
		})
	}
}
