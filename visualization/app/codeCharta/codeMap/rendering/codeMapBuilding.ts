import * as THREE from "three";

export class codeMapBuilding {
    public id : number;
    public boundingBox : THREE.Box3;

    constructor(id : number, box : THREE.Box3)
    {
        this.id = id;
        this.boundingBox = box;
    }
}
