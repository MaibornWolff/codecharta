import BoundingBox, { StreetLayoutValuedCodeMapNode } from "./boundingBox"
import Rectangle from "./rectangle"
import { Vector2 } from "three"

export enum StreetOrientation {
	Horizontal,
	Vertical
}

export default abstract class Street extends BoundingBox {
	public streetRect: Rectangle | undefined
	protected spacer = 2
	protected maxStreetThickness = 10
	protected abstract depth: number

	protected abstract layoutStreet(origin: Vector2, maxNodeSideLength: number): StreetLayoutValuedCodeMapNode
	protected abstract splitChildrenToRows(children: BoundingBox[]): void
	protected abstract calculateStreetOverhang(streetOrigin: Vector2): number
	protected abstract rearrangeRows(): void

	protected getStreetThickness(): number {
		return this.maxStreetThickness / (this.depth + 1)
	}
}
