import Street from "./street"
import { CodeMapNode } from "../../../codeCharta.model"
import { Vector2 } from "three"
import Rectangle from "./rectangle"
import VerticalStreet, { VerticalOrientation } from "./verticalStreet"
import BoundingBox from "./boundingBox"
import { StreetViewHelper } from "./streetViewHelper"

export enum HorizontalOrientation {
    RIGHT,
    LEFT
}

export default class HorizontalStreet extends Street {
    protected children: BoundingBox[] = []
    protected node: CodeMapNode
    protected topRow: BoundingBox[] = []
    protected bottomRow: BoundingBox[] = []
    orientation: HorizontalOrientation

    constructor(node: CodeMapNode, children: BoundingBox[], orientation: HorizontalOrientation = HorizontalOrientation.RIGHT) {
        super(node)
        this.children = children
        this.orientation = orientation
    }

    calculateDimension(metricName: string): void {
        // calculates street width and height
        for (const child of this.children) {
            child.calculateDimension(metricName)
        }

        // splits the children in top and bottom side of the street
        this.splitChildrenToRows(this.children)

        // note : longest street will be last in the row
        this.rearrangeRows()

        // TODO Add a comment what the following calculations are doing.
        this.metricValue = StreetViewHelper.calculateSize(this.node, metricName)
        this.width = Math.max(this.getLength(this.topRow), this.getLength(this.bottomRow))
        this.height = this.getMaxHeight(this.topRow) + this.getStreetThickness() + this.getMaxHeight(this.bottomRow) + 2 * this.spacer
    }

    layout(margin: number, origin: Vector2): CodeMapNode[] {
        const maxTopHeight = this.getMaxHeight(this.topRow)
        const topRowNodes = this.layoutTopRow(origin, maxTopHeight, margin)
        const bottomRowNodes = this.layoutBottomRow(origin, maxTopHeight, margin)
        const streetNode = this.layoutStreet(origin, maxTopHeight)

        return [...topRowNodes, streetNode, ...bottomRowNodes]
    }

    private layoutTopRow(origin: Vector2, maxTopHeight: number, margin: number): CodeMapNode[] {
        const rowOrigin = new Vector2(origin.x, origin.y)
        const nodes: CodeMapNode[] = []

        if (this.orientation === HorizontalOrientation.LEFT) {
            const rowWidth = this.getLength(this.topRow)
            rowOrigin.x += this.width - rowWidth
        }
        for (let index = 0; index < this.topRow.length; index++) {
            const childOriginX = this.calculateChildOriginX(rowOrigin, index, this.topRow)
            const childOriginY = this.calculateStreetOffsetY(rowOrigin, maxTopHeight) - this.topRow[index].height
            const childOrigin = new Vector2(childOriginX, childOriginY)
            nodes.push(...this.topRow[index].layout(margin, childOrigin))
        }
        return nodes
    }

    /**
     * Creates the layout for the street node.
     * @param origin origin of local coordinate system
     * @param maxTopHeight highest node in top row
     */
    protected layoutStreet(origin: Vector2, maxTopHeight: number): CodeMapNode {
        const streetOffsetY = this.calculateStreetOffsetY(origin, maxTopHeight)
        const streetOrigin = new Vector2(origin.x, streetOffsetY)
        const streetOverhang = this.calculateStreetOverhang(streetOrigin)
        const streetWidth = this.width - streetOverhang

        streetOrigin.x += this.orientation === HorizontalOrientation.LEFT ? streetOverhang : 0
        this.streetRect = new Rectangle(streetOrigin, streetWidth, this.getStreetThickness())

        return {
            ...this.node,
            value: this.metricValue,
            rect: this.streetRect,
            zOffset: 0
        } as CodeMapNode
    }

    /**
     * Creates the layout for the bottomRow.
     * @param origin origin of local coordinate system
     * @param maxTopHeight highest node in top row
     */
    private layoutBottomRow(origin: Vector2, maxTopHeight: number, margin: number): CodeMapNode[] {
        const rowOrigin = new Vector2(origin.x, origin.y)
        const nodes: CodeMapNode[] = []

        if (this.orientation === HorizontalOrientation.LEFT) {
            const rowWidth = this.getLength(this.bottomRow)
            rowOrigin.x += this.width - rowWidth
        }
        for (let index = 0; index < this.bottomRow.length; index++) {
            const childOriginX = this.calculateChildOriginX(rowOrigin, index, this.bottomRow)
            const childOriginY = this.calculateStreetOffsetY(rowOrigin, maxTopHeight) + this.getStreetThickness()
            const childOrigin = new Vector2(childOriginX, childOriginY)
            nodes.push(...this.bottomRow[index].layout(margin, childOrigin))
        }
        return nodes
    }

    /**
     * Calculates x-coordinate of current child
     * @param origin origin of local coordinate system
     * @param index index in row of current node
     * @param row the node's row
     */
    private calculateChildOriginX(origin: Vector2, index: number, row: BoundingBox[]): number {
        return origin.x + this.getLengthUntil(row, index)
    }

    /**
     * Calculates y-coordinate of street.
     * @param origin origin of local coordinate system
     * @param maxLeftWidth highest node in topRow
     */
    private calculateStreetOffsetY(origin: Vector2, maxTopHeight: number): number {
        return origin.y + this.spacer + maxTopHeight
    }

    /**
     * Gets total length of the street.
     * @param boxes placed boxes
     */
    private getLength(boxes: BoundingBox[]): number {
        return this.getLengthUntil(boxes, boxes.length)
    }

    /**
     * Gets length of street from start to end index.
     * @param boxes placed boxes
     * @param end end index
     */
    private getLengthUntil(boxes: BoundingBox[], end: number): number {
        let sum = 0

        for (let index = 0; index < end; index++) {
            sum += boxes[index].width
        }
        return sum
    }

    /**
     * Divides children nodes into top- and bottomrow
     * @param children children of the current node
     */
    protected splitChildrenToRows(children: BoundingBox[]): void {
        let totalLength = 0
        let sum = 0

        for (const child of children) {
            totalLength += child.width
        }

        for (const child of children) {
            if (sum <= totalLength / 2) {
                this.topRow.push(child)
                sum += child.width
            } else {
                if (child instanceof VerticalStreet) {
                    child.orientation = VerticalOrientation.DOWN
                }
                this.bottomRow.push(child)
            }
        }
    }

    /**
     * Arranges rows according to their orientation
     */
    protected rearrangeRows(): void {
        if (this.orientation === HorizontalOrientation.RIGHT) {
            this.bottomRow.reverse()
        } else {
            this.topRow.reverse()
        }
    }

    /**
     * Gets the highest box of an array of boxes.
     * @param boxes boxes to be checked
     */
    private getMaxHeight(boxes: BoundingBox[]): number {
        return boxes.reduce((max, n) => Math.max(max, n.height), Number.MIN_VALUE)
    }

    /**
     * Calculates overhang of a street.
     * @param streetOrigin topleft point of street
     */
    protected calculateStreetOverhang(streetOrigin: Vector2): number {
        if (this.orientation === HorizontalOrientation.LEFT) {
            return this.calculateLeftStreetOverhang(streetOrigin)
        }
        return this.calculateRightStreetOverhang(streetOrigin)
    }

    /**
     * Calculates left hand side overhang of a street.
     * @param streetOrigin topleft point of street
     */
    private calculateLeftStreetOverhang(streetOrigin: Vector2): number {
        const firstTopBox = this.topRow[0]
        const firstBottomBox = this.bottomRow[0]
        const topOverhang =
            firstTopBox instanceof VerticalStreet && firstTopBox.streetRect
                ? firstTopBox.streetRect.topLeft.x - streetOrigin.x
                : this.width - this.getLength(this.topRow)
        const bottomOverhang =
            firstBottomBox instanceof VerticalStreet && firstBottomBox.streetRect
                ? firstBottomBox.streetRect.topLeft.x - streetOrigin.x
                : this.width - this.getLength(this.bottomRow)

        return topOverhang > 0 && bottomOverhang > 0 ? Math.min(topOverhang, bottomOverhang) : 0
    }

    /**
     * Calculates right hand side overhang of a street.
     * @param streetOrigin topleft point of street
     */
    private calculateRightStreetOverhang(streetOrigin: Vector2): number {
        const lastTopBox = this.topRow.at(-1)
        const lastBottomBox = this.bottomRow.at(-1)
        const streetRightX = streetOrigin.x + this.width
        const topOverhang =
            lastTopBox instanceof VerticalStreet && lastTopBox.streetRect
                ? streetRightX - lastTopBox.streetRect.getBottomRight().x
                : this.width - this.getLength(this.topRow)
        const bottomOverhang =
            lastBottomBox instanceof VerticalStreet && lastBottomBox.streetRect
                ? streetRightX - lastBottomBox.streetRect.getBottomRight().x
                : this.width - this.getLength(this.bottomRow)

        return topOverhang > 0 && bottomOverhang > 0 ? Math.min(topOverhang, bottomOverhang) : 0
    }
}
