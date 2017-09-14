import * as THREE from "three";
import {MapColors} from "./codeMapMesh";

export class codeMapBuilding {
    public id : number;
    public boundingBox : THREE.Box3;
    public color : number;

    constructor(id : number, box : THREE.Box3, color? : number)
    {
        this.id = id;
        this.boundingBox = box;
        this.color = color ? color : MapColors.defaultC;
    }
}
