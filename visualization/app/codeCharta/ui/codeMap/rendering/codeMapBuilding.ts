import * as THREE from "three";
import {MapColors} from "./renderSettings";
import {Node} from "./node";

export class CodeMapBuilding {
    public id : number;
    public boundingBox : THREE.Box3;
    public color : string;
    public node : Node;
    public parent?: CodeMapBuilding;
    public name?: string;

    constructor(id : number, box : THREE.Box3, node : Node, color? : string)
    {
        this.id = id;
        this.boundingBox = box;
        this.color = color ? color : MapColors.defaultC;
        this.node = node;
    }
}