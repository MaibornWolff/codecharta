import { CodeMapBuilding } from "./codeMapBuilding"
import { Vector3, Ray, Box3 } from "three"
import { Scaling } from "../../../codeCharta.model"

export class CodeMapGeometricDescription {
    private _buildings: CodeMapBuilding[] = []
    private buildingsByPath: Map<string, CodeMapBuilding> = new Map()
    private mapSize: number
    private scales: Vector3
    private scaledBoxes: Box3[] = []
    private boxTranslation = new Vector3()
    private readonly _intersectTarget = new Vector3()

    constructor(mapSize: number) {
        this.mapSize = mapSize
        this.scales = new Vector3(1, 1, 1)
    }

    add(building: CodeMapBuilding) {
        this._buildings.push(building)
        this.buildingsByPath.set(building.node.path, building)
    }

    get buildings() {
        return this._buildings
    }

    setScales(scales: Scaling) {
        this.scales = new Vector3(scales.x, scales.y, scales.z)
        this.rebuildScaledBoxes()
    }

    getBuildingByPath(path: string) {
        return this.buildingsByPath.get(path)
    }

    private rebuildScaledBoxes() {
        this.boxTranslation.set(-this.scales.x * this.mapSize, 0, -this.scales.z * this.mapSize)

        this.scaledBoxes = new Array(this._buildings.length)
        for (let index = 0; index < this._buildings.length; index++) {
            const box = this._buildings[index].boundingBox.clone()
            box.min.multiply(this.scales)
            box.max.multiply(this.scales)
            box.translate(this.boxTranslation)
            this.scaledBoxes[index] = box
        }
    }

    intersect(ray: Ray) {
        let intersectedBuilding: CodeMapBuilding
        let leastIntersectedDistance = Number.POSITIVE_INFINITY

        for (let index = 0; index < this._buildings.length; index++) {
            const box = this.scaledBoxes[index]
            if (!box) {
                continue
            }

            if (this.rayIntersectsAxisAlignedBoundingBox(ray, box)) {
                const intersectionPoint = ray.intersectBox(box, this._intersectTarget)

                if (intersectionPoint) {
                    const intersectionDistance = intersectionPoint.distanceTo(ray.origin)

                    if (intersectionDistance < leastIntersectedDistance) {
                        leastIntersectedDistance = intersectionDistance
                        intersectedBuilding = this._buildings[index]
                    }
                }
            }
        }

        return intersectedBuilding
    }

    private rayIntersectsAxisAlignedBoundingBox(ray: Ray, box: Box3) {
        const tx1 = (box.min.x - ray.origin.x) * (1 / ray.direction.x)
        const tx2 = (box.max.x - ray.origin.x) * (1 / ray.direction.x)

        let tmin = Math.min(tx1, tx2)
        let tmax = Math.max(tx1, tx2)

        const ty1 = (box.min.y - ray.origin.y) * (1 / ray.direction.y)
        const ty2 = (box.max.y - ray.origin.y) * (1 / ray.direction.y)

        tmin = Math.max(tmin, Math.min(ty1, ty2))
        tmax = Math.min(tmax, Math.max(ty1, ty2))

        return tmax >= tmin
    }
}
