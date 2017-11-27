import * as THREE from "three";
import {MapColors} from "./renderSettings.ts";
import {node} from "./node.ts"

export class codeMapBuilding {
    public id : number;
    public boundingBox : THREE.Box3;
    public color : number;
    public node : node;
    public parent?: codeMapBuilding;

    constructor(id : number, box : THREE.Box3, node : node, color? : number)
    {
        this.id = id;
        this.boundingBox = box;
        this.color = color ? color : MapColors.defaultC;
        this.node = node;
    }
}