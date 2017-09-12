import * as THREE from "three";
import {node} from "./node";
import {codeMapGeometricDescription} from "./codeMapGeometricDescription";
import {codeMapBuilding} from "./codeMapBuilding"

class intermediateVertexData {
    public positions : THREE.Vector3[];
    public normals : THREE.Vector3[];
    public colors : number[];
    public subGeometryIdx : number[];

    public indices : number[];

    constructor()
    {
        this.positions = new Array<THREE.Vector3>();
        this.normals = new Array<THREE.Vector3>();
        this.colors = new Array<number>();
        this.subGeometryIdx = new Array<number>();

        this.indices = new Array<number>();
    }

    addVertex(pos : THREE.Vector3, normal : THREE.Vector3, color : number, subGeomIdx : number) : number {
        this.positions.push(pos);
        this.normals.push(normal);
        this.colors.push(color);
        this.subGeometryIdx.push(subGeomIdx);

        return this.positions.length - 1;
    }

    addFace(i0 : number, i1 : number, i2 : number) : void
    {
        this.indices.push(i0, i1, i2);
    }
}

interface boxMeasures {
    x : number,
    y : number,
    z : number,
    width : number,
    height : number,
    depth : number
}

export interface buildResult {
    mesh : THREE.Mesh,
    desc : codeMapGeometricDescription
}

enum MapColors {
    positive = 0x69AE40,
    neutral = 0xddcc00,
    negative = 0x820E0E,
    odd = 0x501A1C,
    even = 0xD1A9A9,
    selected = 0xEB8319,
    defaultC = 0x89ACB4,
    positiveDelta = 0x69ff40,
    negativeDelta = 0xff0E0E
}

export class geometryGenerator {
    constructor() {};

    build(nodes : node[], material : THREE.Material) : buildResult
    {
        let data : intermediateVertexData = new intermediateVertexData();
        let desc : codeMapGeometricDescription = new codeMapGeometricDescription();

        for (let i:number = 0; i < nodes.length; ++i)
        {
            let n : node = nodes[i];

            if (!n.isLeaf)
            {
                this.addFloor(data, n, i, desc);
            }
            else
            {
                this.addBuilding(data, n, i, desc);
            }
        }

        return {
            mesh : this.buildMeshFromIntermediateVertexData(data, material),
            desc : desc
        };
    }

    addBoxToVertexData(data : intermediateVertexData, measures : boxMeasures, color : number, subGeomIdx : number) : void
    {
        let minPos : THREE.Vector3 = new THREE.Vector3(measures.x, measures.y, measures.z);
        let maxPos : THREE.Vector3 = new THREE.Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth);

        const numSides : number = 6;
        const verticesPerSide : number = 4;

        enum sides {
            left = 0,
            right = 1,
            bottom = 2,
            top = 3,
            back = 4,
            front = 5
        };

        enum vertexLocation {
            bottomLeft = 0,
            topLeft = 1,
            topRight = 2,
            bottomRight = 3
        };

        let normals : THREE.Vector3[] = new Array<THREE.Vector3>();
        normals[sides.left] = new THREE.Vector3(-1.0, 0.0, 0.0);
        normals[sides.right] = new THREE.Vector3(1.0, 0.0, 0.0);
        normals[sides.bottom] = new THREE.Vector3(0.0, -1.0, 0.0);
        normals[sides.top] = new THREE.Vector3(0.0, 1.0, 0.0);
        normals[sides.back] = new THREE.Vector3(0.0, 0.0, -1.0);
        normals[sides.front] = new THREE.Vector3(0.0, 0.0, 1.0);

        let positions : THREE.Vector3[] = new Array<THREE.Vector3>();

        //Left Vertices
        positions[sides.left * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(minPos.x, minPos.y, minPos.z);
        positions[sides.left * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(minPos.x, maxPos.y, minPos.z);
        positions[sides.left * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(minPos.x, maxPos.y, maxPos.z);
        positions[sides.left * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(minPos.x, minPos.y, maxPos.z);

        //Bottom Vertices
        positions[sides.bottom * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(minPos.x, minPos.y, minPos.z);
        positions[sides.bottom * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(minPos.x, minPos.y, maxPos.z);
        positions[sides.bottom * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(maxPos.x, minPos.y, maxPos.z);
        positions[sides.bottom * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(maxPos.x, minPos.y, minPos.z);

        //Back Vertices
        positions[sides.back * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(maxPos.x, minPos.y, maxPos.z);
        positions[sides.back * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(minPos.x, minPos.y, maxPos.z);
        positions[sides.back * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(minPos.x, maxPos.y, maxPos.z);
        positions[sides.back * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(maxPos.x, maxPos.y, maxPos.z);

        for (let i : number = 0; i < verticesPerSide; ++i)
        {
            positions[sides.right * verticesPerSide + i] = new THREE.Vector3(
                maxPos.x,
                positions[sides.left * verticesPerSide + i].y,
                positions[sides.left * verticesPerSide + i].z
            );

            positions[sides.top * verticesPerSide + i] = new THREE.Vector3(
                positions[sides.bottom * verticesPerSide + i].x,
                maxPos.y,
                positions[sides.bottom * verticesPerSide + i].z
            );

            positions[sides.front * verticesPerSide + i] = new THREE.Vector3(
                positions[sides.back * verticesPerSide + i].x,
                positions[sides.back * verticesPerSide + i].y,
                minPos.z
            );
        }

        for (let side : number = 0; side < numSides; ++side)
        {
            let indexBottomLeft : number = data.addVertex(positions[side * verticesPerSide + vertexLocation.bottomLeft], normals[side], color, subGeomIdx);
            let indexTopLeft : number = data.addVertex(positions[side * verticesPerSide + vertexLocation.topLeft], normals[side], color, subGeomIdx);
            let indexTopRight : number = data.addVertex(positions[side * verticesPerSide + vertexLocation.topRight], normals[side], color, subGeomIdx);
            let indexBottomRight : number = data.addVertex(positions[side * verticesPerSide + vertexLocation.bottomRight], normals[side], color, subGeomIdx);

            let dimension : number = Math.floor(side / 2);
            let positiveFacing : boolean = normals[side].getComponent(dimension) > 0.0;

            if (!positiveFacing)
            {
                data.addFace(indexBottomLeft, indexTopRight, indexTopLeft);
                data.addFace(indexBottomLeft, indexBottomRight, indexTopRight);
            }
            else
            {
                data.addFace(indexBottomLeft, indexTopLeft, indexTopRight);
                data.addFace(indexBottomLeft, indexTopRight, indexBottomRight);
            }
        }
    }

    private mapNodeToLocalBox(n : node) : boxMeasures
    {
        return {
            x : n.x0,
            y : n.z0,
            z : n.y0,
            width : n.width,
            height : n.height,
            depth : n.length
        };
    }

    addFloor(data : intermediateVertexData, n : node, idx : number, desc : codeMapGeometricDescription)
    {
        let color : number = n.depth % 2 == 0 ? MapColors.even : MapColors.odd;
        let measures : boxMeasures = this.mapNodeToLocalBox(n);

        desc.add(
            new codeMapBuilding(
                idx, new THREE.Box3(
                    new THREE.Vector3(measures.x, measures.y, measures.z),
                    new THREE.Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
                )
            )
        );

        this.addBoxToVertexData(data, measures, color, idx);
    }

/*
this.addBuilding(node.width, node.height, node.length, node.x0, node.z0, node.y0, node.deltas && this.settingsService.settings.deltas ? node.deltas[heightKey] : 0, node, heightKey, showLabel);
    addBuilding(w, h, l, x, y, z, heightDelta, node, heightKey, showLabel) {

        let building = new THREE.Object3D();

        if (heightDelta > 0) {
            if (heightDelta > h) {
                heightDelta = 1; //scale it for the looks, should not happen though
            }
            let cube = this.getTransformedMesh(w, h - heightDelta, l, x + w / 2, y + (h - heightDelta) / 2, z + l / 2, this.assetService.default().clone(), node);
            let cubeD = this.getTransformedMesh(w, heightDelta, l, x + w / 2, y + (heightDelta) / 2 + (h - heightDelta), z + l / 2, this.assetService.positiveDelta().clone(), node);
            cubeD.isDelta = true;
            building.add(cube);
            building.add(cubeD);
            building.node = node;
            this.buildings.add(building);
        } else if (heightDelta < 0) {
            if (-heightDelta > h) {
                heightDelta = -1; //scale it for the looks, should not happen though
            }

            let cube = this.getTransformedMesh(w, h, l, x + w / 2, y + h / 2, z + l / 2, this.assetService.default().clone(), node);
            let cubeD = this.getTransformedMesh(w, -heightDelta, l, x + w / 2, y + (-heightDelta) / 2 + h, z + l / 2, this.assetService.negativeDelta().clone(), node);
            cubeD.isDelta = true;
            building.add(cube);
            building.add(cubeD);
            building.node = node;
            this.buildings.add(building);
        } else {
            let cube = this.getTransformedMesh(w, h, l, x + w / 2, y + h / 2, z + l / 2, this.assetService.default().clone(), node);
            building.add(cube);
            building.node = node;
            this.buildings.add(building);
        }
    }

*/

    addBuilding(data : intermediateVertexData, n : node, idx : number, desc : codeMapGeometricDescription) : void
    {
        let measures : boxMeasures = this.mapNodeToLocalBox(n);

        desc.add(
            new codeMapBuilding(
                idx, new THREE.Box3(
                    new THREE.Vector3(measures.x, measures.y, measures.z),
                    new THREE.Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
                )
            )
        );

        this.addBoxToVertexData(data, measures, MapColors.defaultC, idx);
    }

    buildMeshFromIntermediateVertexData(data : intermediateVertexData, material : THREE.Material) : THREE.Mesh
    {
        let numVertices : number = data.positions.length;
        const dimension : number = 3;

        let positions : Float32Array = new Float32Array( numVertices * dimension);
        let normals : Float32Array = new Float32Array( numVertices * dimension);
        let colors : Float32Array = new Float32Array( numVertices * dimension);
        let ids : Float32Array = new Float32Array( numVertices );

        for (let i : number = 0; i < numVertices; ++i)
        {
            positions[i * 3 + 0] = data.positions[i].x;
            positions[i * 3 + 1] = data.positions[i].y;
            positions[i * 3 + 2] = data.positions[i].z;

            colors[i * 3 + 0] = ((data.colors[i]  >> 16) & 0xFF) / 255.0;
            colors[i * 3 + 1] = ((data.colors[i] >> 8) & 0xFF) / 255.0;
            colors[i * 3 + 2] = (data.colors[i] & 0xFF) / 255.0;

            normals[i * 3 + 0] = data.normals[i].x; 
            normals[i * 3 + 1] = data.normals[i].y;
            normals[i * 3 + 2] = data.normals[i].z;

            ids[i] = data.subGeometryIdx[i];
        }

        let indices : Uint32Array = new Uint32Array(data.indices.length);

        for (let i : number = 0; i < data.indices.length; ++i)
        {
            indices[i] = data.indices[i];
        }

        let geometry : THREE.BufferGeometry = new THREE.BufferGeometry();

        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
        geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
        geometry.addAttribute( 'subGeomIdx' , new THREE.BufferAttribute(ids, 1));

        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        geometry.computeBoundingBox();

        return  new THREE.Mesh(geometry, material);
    }

    /*
    colorMap(colorKey : string, neutralColorRange : Range) {
        this.root.traverse((o)=> {

            if (o.node && o.node.isLeaf) {

                this.colorBase(o, colorKey, neutralColorRange);
                this.colorDelta(o);

            } else if (o.node && !o.node.isLeaf) {

                o.originalMaterial = o.material.clone();
                o.selectedMaterial = this.assetService.selected().clone();

            } // else: object is propably a Grouping Object with no node data

        });
    }

    colorBase(o, colorKey, neutralColorRange) {

        let base = o.children.filter((c)=>!c.isDelta)[0];

        if (!base) {
            return;
        }

        const val = base.node.attributes[colorKey];
        if (val < neutralColorRange.from) {
            base.originalMaterial = neutralColorRange.flipped ? this.assetService.negative().clone() : this.assetService.positive().clone();
        } else if (val > neutralColorRange.to) {
            base.originalMaterial = neutralColorRange.flipped ? this.assetService.positive().clone() : this.assetService.negative().clone();
        } else {
            base.originalMaterial = this.assetService.neutral().clone();
        }

        base.selectedMaterial = this.assetService.selected().clone();
        base.material = base.originalMaterial.clone();


    }
    */
}