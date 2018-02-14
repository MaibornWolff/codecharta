import {codeMapBuilding} from "./codeMapBuilding";
import * as THREE from "three"

export interface intersectionResult {
    intersectionFound : boolean;
    building? : codeMapBuilding
}

export class codeMapGeometricDescription {
    private buildings : codeMapBuilding[];
    private mapSize : number;
    private scales : THREE.Vector3;
    constructor(mapSize : number)
    {
        this.buildings = new Array<codeMapBuilding>();
        this.mapSize = mapSize;
        this.scales = new THREE.Vector3(1, 1, 1);
    }

    add(building : codeMapBuilding) : void
    {
        this.buildings.push(building);
    }

    setScales(scales : THREE.Vector3)
    {
        this.scales = scales;
    }

    //TODO Performance
    intersect(ray : THREE.Ray) : intersectionResult
    {
        let intersectedBuilding : codeMapBuilding | null = null;
        let leastIntersectedDistance : number = Infinity;

        let boxTranslation = new THREE.Vector3(-this.mapSize * this.scales.x * 0.5, 0.0, -this.mapSize * this.scales.z * 0.5);

        for (let building of this.buildings)
        {

            //Pre Transformation
            let box : THREE.Box3 = building.boundingBox.clone();
            
            box.min.x *= this.scales.x;
            box.min.y *= this.scales.y;
            box.min.z *= this.scales.z;
            
            box.max.x *= this.scales.x;
            box.max.y *= this.scales.y;
            box.max.z *= this.scales.z;
            
            box.translate(boxTranslation);
            
            // ray - axis aligned bounding box intersection method "slab"
            
            let tx1 = (box.min.x - ray.origin.x)*(1/ray.direction.x);
            let tx2 = (box.max.x - ray.origin.x)*(1/ray.direction.x);

            let tmin = Math.min(tx1, tx2);
            let tmax = Math.max(tx1, tx2);

            let ty1 = (box.min.y - ray.origin.y)*(1/ray.direction.y);
            let ty2 = (box.max.y - ray.origin.y)*(1/ray.direction.y);

            tmin = Math.max(tmin, Math.min(ty1, ty2));
            tmax = Math.min(tmax, Math.max(ty1, ty2));

            if(tmax >= tmin){ // TODO this is just some kind of efficient prefiltering since we still use ray.intersectBox and distance to

                let intersectionPoint : THREE.Vector3 = ray.intersectBox(box);

                if (intersectionPoint)
                {
                    let intersectionDistance : number = intersectionPoint.distanceTo(ray.origin);

                    if (intersectionDistance < leastIntersectedDistance)
                    {
                        leastIntersectedDistance = intersectionDistance;
                        intersectedBuilding = building;
                    }
                }

            }

        }

        if (intersectedBuilding)
        {
            return {
                intersectionFound : true,
                building : intersectedBuilding
            }
        }
        else
        {
            return {
                intersectionFound : false
            }
        }
    }
}