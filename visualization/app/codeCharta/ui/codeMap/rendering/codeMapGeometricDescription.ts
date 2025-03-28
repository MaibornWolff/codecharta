import { CodeMapBuilding } from "./codeMapBuilding"
import { Vector3, Ray, Box3 } from "three"
import { Scaling } from "../../../codeCharta.model"

export class CodeMapGeometricDescription {
    private _buildings: CodeMapBuilding[] // todo tk: depending on how many buildings, refactor this to { [node.path]: node } might give `this.getBuildingByPath` a performance boost
    private mapSize: number
    private scales: Vector3

    constructor(mapSize: number) {
        this._buildings = new Array<CodeMapBuilding>()
        this.mapSize = mapSize
        this.scales = new Vector3(1, 1, 1)
    }

    add(building: CodeMapBuilding) {
        this._buildings.push(building)
    }

    get buildings() {
        return this._buildings
    }

    setScales(scales: Scaling) {
        this.scales = new Vector3(scales.x, scales.y, scales.z)
    }

    getBuildingByPath(path: string) {
        return this.buildings.find(x => x.node.path === path)
    }

    intersect(ray: Ray) {
        let intersectedBuilding: CodeMapBuilding
        let leastIntersectedDistance = Number.POSITIVE_INFINITY

        const boxTranslation = this.scales
            .clone()
            .multiplyScalar(this.mapSize)
            .multiply(new Vector3(-1, 0, -1))

        for (const building of this._buildings) {
            const box: Box3 = building.boundingBox.clone()
            box.min.multiply(this.scales)
            box.max.multiply(this.scales)
            box.translate(boxTranslation)

            if (this.rayIntersectsAxisAlignedBoundingBox(ray, box)) {
                const intersectionPoint: Vector3 = ray.intersectBox(box, new Vector3())

                if (intersectionPoint) {
                    const intersectionDistance = intersectionPoint.distanceTo(ray.origin)

                    if (intersectionDistance < leastIntersectedDistance) {
                        leastIntersectedDistance = intersectionDistance
                        intersectedBuilding = building
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
