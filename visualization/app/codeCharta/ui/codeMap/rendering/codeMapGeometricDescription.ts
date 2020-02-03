import { CodeMapBuilding } from "./codeMapBuilding"
import { Vector3, Ray, Box3 } from "three"

export class CodeMapGeometricDescription {
	get buildings(): CodeMapBuilding[] {
		return this._buildings
	}
	private _buildings: CodeMapBuilding[]
	private mapSize: number
	private scales: Vector3

	constructor(mapSize: number) {
		this._buildings = new Array<CodeMapBuilding>()
		this.mapSize = mapSize
		this.scales = new Vector3(1, 1, 1)
	}

	public add(building: CodeMapBuilding): void {
		this._buildings.push(building)
	}

	public setScales(scales: Vector3) {
		this.scales = scales
	}

	public getBuildingByPath(path: string) {
		return this.buildings.find(x => x.node.path === path)
	}

	public intersect(ray: Ray): CodeMapBuilding {
		let intersectedBuilding: CodeMapBuilding
		let leastIntersectedDistance: number = Infinity

		let boxTranslation = new Vector3(-this.mapSize * this.scales.x, 0.0, -this.mapSize * this.scales.z)

		for (let building of this._buildings) {
			//Pre Transformation
			let box: Box3 = building.boundingBox.clone()

			box.min.x *= this.scales.x
			box.min.y *= this.scales.y
			box.min.z *= this.scales.z

			box.max.x *= this.scales.x
			box.max.y *= this.scales.y
			box.max.z *= this.scales.z

			box.translate(boxTranslation)

			if (this.rayIntersectsAxisAlignedBoundingBox(ray, box)) {
				let intersectionPoint: Vector3 = ray.intersectBox(box)

				if (intersectionPoint) {
					let intersectionDistance: number = intersectionPoint.distanceTo(ray.origin)

					if (intersectionDistance < leastIntersectedDistance) {
						leastIntersectedDistance = intersectionDistance
						intersectedBuilding = building
					}
				}
			}
		}

		return intersectedBuilding
	}

	private rayIntersectsAxisAlignedBoundingBox(ray: Ray, box: Box3): boolean {
		let tx1 = (box.min.x - ray.origin.x) * (1 / ray.direction.x)
		let tx2 = (box.max.x - ray.origin.x) * (1 / ray.direction.x)

		let tmin = Math.min(tx1, tx2)
		let tmax = Math.max(tx1, tx2)

		let ty1 = (box.min.y - ray.origin.y) * (1 / ray.direction.y)
		let ty2 = (box.max.y - ray.origin.y) * (1 / ray.direction.y)

		tmin = Math.max(tmin, Math.min(ty1, ty2))
		tmax = Math.min(tmax, Math.max(ty1, ty2))

		return tmax >= tmin
	}
}
