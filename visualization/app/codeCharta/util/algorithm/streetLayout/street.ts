import BoundingBox from "./boundingBox"
import Rectangle from "../rectangle"
import Point from "../point"
import { StreetLayoutValuedCodeMapNode } from "../../streetLayoutGenerator"

export default abstract class Street extends BoundingBox {
	public streetRect: Rectangle | undefined
	protected spacer = 2
	protected maxStreetThickness = 10
	protected abstract depth: number

	protected abstract layoutStreet(origin: Point, maxNodeSideLength: number): StreetLayoutValuedCodeMapNode
	protected abstract splitChildrenToRows(children: BoundingBox[]): void
	protected abstract calculateStreetOverhang(streetOrigin: Point): number
	protected abstract rearrangeRows(): void

	protected getStreetThickness(): number {
		return this.maxStreetThickness / (this.depth + 1)
	}
}
