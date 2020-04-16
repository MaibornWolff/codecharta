import BoundingBox from "./boundingBox"
import Rectangle from "../rectangle"
import Point from "../point"
import HorizontalStreet, { HorizontalOrientation } from "./horizontalStreet"
import Street from "./street"
import { CodeMapNode } from "../../../codeCharta.model"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"
import { LayoutHelper } from "../../layoutHelper"

export enum VerticalOrientation {
	UP,
	DOWN
}

export default class VerticalStreet extends Street {
	private children: BoundingBox[] = []
	protected leftRow: BoundingBox[] = []
	protected rightRow: BoundingBox[] = []
	public orientation: VerticalOrientation
	protected depth: number

	constructor(node: CodeMapNode, children: BoundingBox[], depth: number, orientation: VerticalOrientation = VerticalOrientation.UP) {
		super(node)
		this.children = children
		this.depth = depth
		this.orientation = orientation
	}

	public calculateDimension(metricName: string): void {
		for (const child of this.children) {
			child.calculateDimension(metricName)
		}
		this.splitChildrenToRows(this.children)
		this.rearrangeRows()

		this.metricValue = LayoutHelper.calculateSize(this.node, metricName)
		this.width = this.getMaxWidth(this.leftRow) + this.getStreetThickness() + this.getMaxWidth(this.rightRow) + 2 * this.spacer
		this.height = Math.max(this.getLength(this.leftRow), this.getLength(this.rightRow))
	}

	public layout(origin: Point, margin: number): StreetLayoutValuedCodeMapNode[] {
		const maxLeftWidth = this.getMaxWidth(this.leftRow)
		const leftRowNodes = this.layoutLeftRow(origin, maxLeftWidth, margin)
		const rightRowNodes = this.layoutRightRow(origin, maxLeftWidth, margin)
		const streetNode = this.layoutStreet(origin, maxLeftWidth)

		return [...leftRowNodes, streetNode, ...rightRowNodes]
	}

	private layoutLeftRow(origin: Point, maxLeftWidth: number, margin: number): StreetLayoutValuedCodeMapNode[] {
		const rowOrigin = new Point(origin.x, origin.y)
		const nodes: StreetLayoutValuedCodeMapNode[] = []

		if (this.orientation === VerticalOrientation.UP) {
			const rowHeight = this.getLength(this.leftRow)
			rowOrigin.y += this.height - rowHeight
		}
		for (let i = 0; i < this.leftRow.length; i++) {
			const childOriginX = this.calculateStreetOffsetX(rowOrigin, maxLeftWidth) - this.leftRow[i].width
			const childOriginY = this.calculateChildOriginY(rowOrigin, i, this.leftRow)
			const childOrigin = new Point(childOriginX, childOriginY)
			nodes.push.apply(nodes, this.leftRow[i].layout(childOrigin, margin))
		}
		return nodes
	}

	protected layoutStreet(origin: Point, maxLeftWidth: number): StreetLayoutValuedCodeMapNode {
		const streetOffsetX = this.calculateStreetOffsetX(origin, maxLeftWidth)
		const streetOrigin = new Point(streetOffsetX, origin.y)
		const streetOverhang = this.calculateStreetOverhang(streetOrigin)
		const streetHeight = this.height - streetOverhang
		const metricValue = this.metricValue

		streetOrigin.y += this.orientation === VerticalOrientation.UP ? streetOverhang : 0
		this.streetRect = new Rectangle(streetOrigin, this.getStreetThickness(), streetHeight)

		return {
			data: this.node,
			value: metricValue,
			rect: this.streetRect,
			zOffset: 0
		} as StreetLayoutValuedCodeMapNode
	}

	private layoutRightRow(origin: Point, maxLeftWidth: number, margin: number): StreetLayoutValuedCodeMapNode[] {
		const rowOrigin = new Point(origin.x, origin.y)
		const nodes: StreetLayoutValuedCodeMapNode[] = []

		if (this.orientation === VerticalOrientation.UP) {
			const rowHeight = this.getLength(this.rightRow)
			rowOrigin.y += this.height - rowHeight
		}
		for (let i = 0; i < this.rightRow.length; i++) {
			const childOriginX = this.calculateStreetOffsetX(rowOrigin, maxLeftWidth) + this.getStreetThickness()
			const childOriginY = this.calculateChildOriginY(rowOrigin, i, this.rightRow)
			const childOrigin = new Point(childOriginX, childOriginY)
			nodes.push.apply(nodes, this.rightRow[i].layout(childOrigin, margin))
		}
		return nodes
	}

	private calculateStreetOffsetX(origin: Point, maxLeftWidth: number): number {
		return origin.x + this.spacer + maxLeftWidth
	}

	private calculateChildOriginY(origin: Point, index: number, row: BoundingBox[]): number {
		return origin.y + this.getLengthUntil(row, index)
	}

	private getLength(boxes: BoundingBox[]): number {
		return this.getLengthUntil(boxes, boxes.length)
	}

	private getLengthUntil(boxes: BoundingBox[], end: number): number {
		let sum: number = 0

		for (let i = 0; i < end; i++) {
			sum += boxes[i].height
		}
		return sum
	}

	protected splitChildrenToRows(children: BoundingBox[]) {
		const totalLength = this.getLength(children)
		let sum = 0

		for (let i = 0; i < children.length; i++) {
			if (sum < totalLength / 2) {
				if (children[i] instanceof HorizontalStreet) {
					;(<HorizontalStreet>children[i]).orientation = HorizontalOrientation.LEFT
				}
				this.leftRow.push(children[i])
				sum += children[i].height
			} else {
				this.rightRow.push(children[i])
			}
		}
	}

	protected rearrangeRows(): void {
		if (this.orientation === VerticalOrientation.UP) {
			this.leftRow = this.leftRow.reverse()
		} else {
			this.rightRow = this.rightRow.reverse()
		}
	}

	private getMaxWidth(boxes: BoundingBox[]): number {
		return boxes.reduce((max, n) => Math.max(max, n.width), Number.MIN_VALUE)
	}

	protected calculateStreetOverhang(streetOrigin: Point): number {
		if (this.orientation === VerticalOrientation.UP) {
			return this.calculateTopStreetOverhang(streetOrigin)
		}
		return this.calculateBottomStreetOverhang(streetOrigin)
	}

	private calculateTopStreetOverhang(streetOrigin: Point): number {
		const firstLeftNode = this.leftRow[0]
		const firstRightNode = this.rightRow[0]
		const leftOverhang =
			firstLeftNode instanceof HorizontalStreet
				? firstLeftNode.streetRect!.topLeft.y - streetOrigin.y
				: this.height - this.getLength(this.leftRow)
		const rightOverhang =
			firstRightNode instanceof HorizontalStreet
				? firstRightNode.streetRect!.topLeft.y - streetOrigin.y
				: this.height - this.getLength(this.rightRow)

		return leftOverhang > 0 && rightOverhang > 0 ? Math.min(leftOverhang, rightOverhang) : 0
	}

	private calculateBottomStreetOverhang(streetOrigin: Point): number {
		const lastLeftNode = this.leftRow[this.leftRow.length - 1]
		const lastRightNode = this.rightRow[this.rightRow.length - 1]
		const streetBottomY = streetOrigin.y + this.height
		const leftOverhang =
			lastLeftNode instanceof HorizontalStreet
				? streetBottomY - lastLeftNode.streetRect!.getBottomRight().y
				: this.height - this.getLength(this.leftRow)
		const rightOverhang =
			lastRightNode instanceof HorizontalStreet
				? streetBottomY - lastRightNode.streetRect!.getBottomRight().y
				: this.height - this.getLength(this.rightRow)

		return leftOverhang > 0 && rightOverhang > 0 ? Math.min(leftOverhang, rightOverhang) : 0
	}
}
