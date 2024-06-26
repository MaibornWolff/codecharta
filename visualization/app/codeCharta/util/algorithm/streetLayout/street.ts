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
    private maxStreetThickness = 8
    private rootStreetThickness = 20
    protected abstract depth: number

    protected abstract layoutStreet(origin: Vector2, maxNodeSideLength: number): CodeMapNode
    protected abstract splitChildrenToRows(children: BoundingBox[]): void
    protected abstract calculateStreetOverhang(streetOrigin: Vector2): number
    protected abstract rearrangeRows(): void

    protected getStreetThickness(): number {
        const pathParts = this.node.path.split("/")
        const isDirectChildOfRoot = this.node.path.startsWith("/root/") && pathParts.length === 3 && pathParts[2] !== ""

        return this.node.path === "/root" || isDirectChildOfRoot ? this.rootStreetThickness : this.maxStreetThickness / (this.depth + 1)
    }
}
