import BoundingBox from "./boundingBox"
import Rectangle from "./rectangle"
import HorizontalStreet, { HorizontalOrientation } from "./horizontalStreet"
import Street from "./street"
import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { StreetViewHelper } from "./streetViewHelper"
import { Vector2 } from "three"

export enum VerticalOrientation {
    UP,
    DOWN
}

export default class VerticalStreet extends Street {
    protected children: BoundingBox[] = []
    protected leftRow: BoundingBox[] = []
    protected rightRow: BoundingBox[] = []
    orientation: VerticalOrientation
    private _origin: Vector2

    constructor(node: CodeMapNode, children: BoundingBox[], depth: number, orientation: VerticalOrientation = VerticalOrientation.UP) {
        super(node)
        this.children = children
        this.orientation = orientation
    }

    calculateDimension(metricName: string): void {
        for (const child of this.children) {
            child.calculateDimension(metricName)
        }
        this.splitChildrenToRows(this.children)
        this.rearrangeRows()

        // TODO refactor it - seems to be very similar to horizontalStreet.ts
        // TODO add a comment what the calculations are doing and why
        this.metricValue = StreetViewHelper.calculateSize(this.node, metricName)
        this.width = this.getMaxWidth(this.leftRow) + this.getStreetThickness() + this.getMaxWidth(this.rightRow) + 2 * this.spacer
        this.height = Math.max(this.getLength(this.leftRow), this.getLength(this.rightRow))
    }

    layout(margin: number, origin: Vector2): CodeMapNode[] {
        const maxLeftWidth = this.getMaxWidth(this.leftRow)
        const leftRowNodes = this.layoutLeftRow(origin, maxLeftWidth, margin)
        const rightRowNodes = this.layoutRightRow(origin, maxLeftWidth, margin)
        const streetNode = this.layoutStreet(origin, maxLeftWidth)

        return [...leftRowNodes, streetNode, ...rightRowNodes]
    }

    private layoutLeftRow(origin: Vector2, maxLeftWidth: number, margin: number): CodeMapNode[] {
        const rowOrigin = new Vector2(origin.x, origin.y)
        const nodes: CodeMapNode[] = []

        if (this.orientation === VerticalOrientation.UP) {
            const rowHeight = this.getLength(this.leftRow)
            rowOrigin.y += this.height - rowHeight
        }
        for (let index = 0; index < this.leftRow.length; index++) {
            const childOriginX = this.calculateStreetOffsetX(rowOrigin, maxLeftWidth) - this.leftRow[index].width
            const childOriginY = this.calculateChildOriginY(rowOrigin, index, this.leftRow)
            const childOrigin = new Vector2(childOriginX, childOriginY)
            nodes.push(...this.leftRow[index].layout(margin, childOrigin))
        }
        return nodes
    }

    protected layoutStreet(origin: Vector2, maxLeftWidth: number): CodeMapNode {
        const streetOffsetX = this.calculateStreetOffsetX(origin, maxLeftWidth)
        const streetOrigin = new Vector2(streetOffsetX, origin.y)
        const streetOverhang = this.calculateStreetOverhang(streetOrigin)
        const streetHeight = this.height - streetOverhang
        const metricValue = this.metricValue

        streetOrigin.y += this.orientation === VerticalOrientation.UP ? streetOverhang : 0
        this.streetRect = new Rectangle(streetOrigin, this.getStreetThickness(), streetHeight)

        return {
            ...this.node,
            value: metricValue,
            rect: this.streetRect,
            zOffset: 0
        }
    }

    private layoutRightRow(origin: Vector2, maxLeftWidth: number, margin: number): CodeMapNode[] {
        const rowOrigin = new Vector2(origin.x, origin.y)
        const nodes: CodeMapNode[] = []

        if (this.orientation === VerticalOrientation.UP) {
            const rowHeight = this.getLength(this.rightRow)
            rowOrigin.y += this.height - rowHeight
        }
        for (let index = 0; index < this.rightRow.length; index++) {
            const childOriginX = this.calculateStreetOffsetX(rowOrigin, maxLeftWidth) + this.getStreetThickness()
            const childOriginY = this.calculateChildOriginY(rowOrigin, index, this.rightRow)
            const childOrigin = new Vector2(childOriginX, childOriginY)
            nodes.push(...this.rightRow[index].layout(margin, childOrigin))
        }
        return nodes
    }

    private calculateStreetOffsetX(origin: Vector2, maxLeftWidth: number): number {
        return origin.x + this.spacer + maxLeftWidth
    }

    private calculateChildOriginY(origin: Vector2, index: number, row: BoundingBox[]): number {
        return origin.y + this.getLengthUntil(row, index)
    }

    private getLength(boxes: BoundingBox[]): number {
        return this.getLengthUntil(boxes, boxes.length)
    }

    private getLengthUntil(boxes: BoundingBox[], end: number): number {
        let sum = 0

        for (let index = 0; index < end; index++) {
            sum += boxes[index].height
        }
        return sum
    }

    protected sortChildrenByType(children: BoundingBox[]): void {
        children.sort((a, b) => {
            if (a.node.type === b.node.type) {
                return 0
            }
            if (a.node.type === NodeType.FILE) {
                return -1
            }
            return 1
        })
    }
    protected splitChildrenToRows(children: BoundingBox[]): void {
        this.sortChildrenByType(children)

        let totalLength = 0
        let sum = 0

        for (const child of children) {
            totalLength += child.height
        }

        for (const child of children) {
            if (sum <= totalLength / 2) {
                if (child instanceof HorizontalStreet) {
                    child.orientation = HorizontalOrientation.LEFT
                }
                this.leftRow.push(child)
                sum += child.height
            } else {
                this.rightRow.push(child)
            }
        }
    }

    protected rearrangeRows(): void {
        if (this.orientation === VerticalOrientation.UP) {
            this.leftRow.reverse()
        } else {
            this.rightRow.reverse()
        }
    }

    private getMaxWidth(boxes: BoundingBox[]): number {
        return boxes.reduce((max, n) => Math.max(max, n.width), Number.MIN_VALUE)
    }

    protected calculateStreetOverhang(streetOrigin: Vector2): number {
        if (this.orientation === VerticalOrientation.UP) {
            return this.calculateTopStreetOverhang(streetOrigin)
        }
        return this.calculateBottomStreetOverhang(streetOrigin)
    }

    private calculateTopStreetOverhang(streetOrigin: Vector2): number {
        const firstLeftNode = this.leftRow[0]
        const firstRightNode = this.rightRow[0]
        const leftOverhang =
            firstLeftNode instanceof HorizontalStreet && firstLeftNode.streetRect
                ? firstLeftNode.streetRect.topLeft.y - streetOrigin.y
                : this.height - this.getLength(this.leftRow)
        const rightOverhang =
            firstRightNode instanceof HorizontalStreet && firstRightNode.streetRect
                ? firstRightNode.streetRect.topLeft.y - streetOrigin.y
                : this.height - this.getLength(this.rightRow)

        return leftOverhang > 0 && rightOverhang > 0 ? Math.min(leftOverhang, rightOverhang) : 0
    }

    private calculateBottomStreetOverhang(streetOrigin: Vector2): number {
        const lastLeftNode = this.leftRow.at(-1)
        const lastRightNode = this.rightRow.at(-1)
        const streetBottomY = streetOrigin.y + this.height
        const leftOverhang =
            lastLeftNode instanceof HorizontalStreet && lastLeftNode.streetRect
                ? streetBottomY - lastLeftNode.streetRect.getBottomRight().y
                : this.height - this.getLength(this.leftRow)
        const rightOverhang =
            lastRightNode instanceof HorizontalStreet && lastRightNode.streetRect
                ? streetBottomY - lastRightNode.streetRect.getBottomRight().y
                : this.height - this.getLength(this.rightRow)

        return leftOverhang > 0 && rightOverhang > 0 ? Math.min(leftOverhang, rightOverhang) : 0
    }
}
