import BoundingBox from "./boundingBox"
import Rectangle from "./rectangle"
import { Vector2 } from "three"
import { CodeMapNode } from "../../../codeCharta.model"

export enum StreetOrientation {
    Horizontal,
    Vertical
}

export default abstract class Street extends BoundingBox {
    streetRect: Rectangle | undefined
    protected spacer = 2

    protected abstract layoutStreet(origin: Vector2, maxNodeSideLength: number): CodeMapNode
    protected abstract splitChildrenToRows(children: BoundingBox[]): void
    protected abstract calculateStreetOverhang(streetOrigin: Vector2): number
    protected abstract rearrangeRows(): void

    protected getStreetThickness(): number {
        const pathParts = this.mapNode.path.split("/")
        const isDirectChildOfRoot = this.mapNode.path.startsWith("/root/") && pathParts.length === 3 && pathParts[2] !== ""

        return this.mapNode.path === "/root" || isDirectChildOfRoot
            ? this.calculateRootStreetThickness(this.mapNode)
            : this.calculateNonRootThickness(this.mapNode)
    }

    protected calculateNonRootThickness(node: CodeMapNode): number {
        const baseThickness = 2
        const sizeFactor = 0.0005
        const fileSize = node.attributes.unary
        return baseThickness + fileSize * sizeFactor
    }

    protected calculateRootStreetThickness(node: CodeMapNode): number {
        const baseThickness = 8
        const sizeFactor = 0.001
        const fileSize = node.attributes.unary
        return baseThickness + fileSize * sizeFactor
    }
}
