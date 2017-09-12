import {codeMapBuilding} from "./codeMapBuilding";

interface intersectionResult {
    intersectionFound : boolean;
    building? : codeMapBuilding
}

export class codeMapGeometricDescription {
    private buildings : codeMapBuilding[];

    constructor()
    {
        this.buildings = new Array<codeMapBuilding>();
    }

    add(building : codeMapBuilding) : void
    {
        this.buildings.push(building);
    }

    intersect(ray : THREE.Ray) : intersectionResult
    {
        let intersectedBuilding : codeMapBuilding = null;
        let leastIntersectedDistance : number = Infinity;

        for (let building of this.buildings)
        {
            let intersectionPoint : THREE.Vector3 = ray.intersectBox(building.boundingBox);

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