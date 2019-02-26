import * as THREE from "three";

export class IntermediateVertexData {
    public positions : THREE.Vector3[];
    public normals : THREE.Vector3[];
    public uvs : THREE.Vector2[];
    public colors : string[];
    public subGeometryIdx : number[];
    public deltas : number[];

    public indices : number[];

    constructor()
    {
        this.positions = new Array<THREE.Vector3>();
        this.normals = new Array<THREE.Vector3>();
        this.uvs = new Array<THREE.Vector2>();
        this.colors = new Array<string>();
        this.subGeometryIdx = new Array<number>();
        this.deltas = new Array<number>();

        this.indices = new Array<number>();
    }

    public addVertex(pos : THREE.Vector3, normal : THREE.Vector3, uv : THREE.Vector2, color : string, subGeomIdx : number, delta : number) : number {
        this.positions.push(pos);
        this.normals.push(normal);
        this.uvs.push(uv);
        this.colors.push(color);
        this.subGeometryIdx.push(subGeomIdx);
        this.deltas.push(delta);

        return this.positions.length - 1;
    }

    public addFace(i0 : number, i1 : number, i2 : number) : void
    {
        this.indices.push(i0, i1, i2);
    }
}