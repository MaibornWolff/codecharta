import * as THREE from "three";
import {node} from "./node";
import {codeMapGeometricDescription} from "./codeMapGeometricDescription";
import {codeMapBuilding} from "./codeMapBuilding";
import {MapColors} from "./renderSettings";
import {colorRange} from "./renderSettings";
import {renderSettings} from "./renderSettings";
import {renderingUtil} from "./renderingUtil";

class intermediateVertexData {
    public positions : THREE.Vector3[];
    public normals : THREE.Vector3[];
    public uvs : THREE.Vector2[];
    public colors : number[];
    public subGeometryIdx : number[];
    public deltas : number[];

    public indices : number[];

    constructor()
    {
        this.positions = new Array<THREE.Vector3>();
        this.normals = new Array<THREE.Vector3>();
        this.uvs = new Array<THREE.Vector2>();
        this.colors = new Array<number>();
        this.subGeometryIdx = new Array<number>();
        this.deltas = new Array<number>();

        this.indices = new Array<number>();
    }

    addVertex(pos : THREE.Vector3, normal : THREE.Vector3, uv : THREE.Vector2, color : number, subGeomIdx : number, delta : number) : number {
        this.positions.push(pos);
        this.normals.push(normal);
        this.uvs.push(uv);
        this.colors.push(color);
        this.subGeometryIdx.push(subGeomIdx);
        this.deltas.push(delta);

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

export class geometryGenerator {
    constructor() {};

    public build(nodes : node[], material : THREE.Material, settings : renderSettings) : buildResult
    {
        let data : intermediateVertexData = new intermediateVertexData();
        let desc : codeMapGeometricDescription = new codeMapGeometricDescription(settings.mapSize);

        for (let i:number = 0; i < nodes.length; ++i)
        {
            let n : node = nodes[i];

            if (!n.isLeaf)
            {
                this.addFloor(data, n, i, desc);
            }
            else
            {
                this.addBuilding(data, n, i, desc, settings);
            }
        }

        return {
            mesh : this.buildMeshFromIntermediateVertexData(data, material),
            desc : desc
        };
    }

    private addBoxToVertexData(data : intermediateVertexData, measures : boxMeasures, color : number, subGeomIdx : number, delta : number) : void
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

        let uvs : THREE.Vector2[] = new Array<THREE.Vector2>();
        let positions : THREE.Vector3[] = new Array<THREE.Vector3>();

        //Left Vertices
        positions[sides.left * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(minPos.x, minPos.y, minPos.z);
        positions[sides.left * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(minPos.x, maxPos.y, minPos.z);
        positions[sides.left * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(minPos.x, maxPos.y, maxPos.z);
        positions[sides.left * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(minPos.x, minPos.y, maxPos.z);
        uvs[sides.left * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector2(1.0, 0.0);
        uvs[sides.left * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector2(1.0, 1.0);
        uvs[sides.left * verticesPerSide + vertexLocation.topRight] = new THREE.Vector2(0.0, 1.0);
        uvs[sides.left * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector2(0.0, 0.0);

        //Bottom Vertices
        positions[sides.bottom * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(minPos.x, minPos.y, minPos.z);
        positions[sides.bottom * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(minPos.x, minPos.y, maxPos.z);
        positions[sides.bottom * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(maxPos.x, minPos.y, maxPos.z);
        positions[sides.bottom * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(maxPos.x, minPos.y, minPos.z);
        uvs[sides.bottom * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector2(0.0, 1.0);
        uvs[sides.bottom * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector2(1.0, 1.0);
        uvs[sides.bottom * verticesPerSide + vertexLocation.topRight] = new THREE.Vector2(1.0, 0.0);
        uvs[sides.bottom * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector2(0.0, 0.0);

        //Back Vertices
        positions[sides.back * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector3(maxPos.x, minPos.y, maxPos.z);
        positions[sides.back * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector3(minPos.x, minPos.y, maxPos.z);
        positions[sides.back * verticesPerSide + vertexLocation.topRight] = new THREE.Vector3(minPos.x, maxPos.y, maxPos.z);
        positions[sides.back * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector3(maxPos.x, maxPos.y, maxPos.z);
        uvs[sides.back * verticesPerSide + vertexLocation.bottomLeft] = new THREE.Vector2(0.0, 0.0);
        uvs[sides.back * verticesPerSide + vertexLocation.topLeft] = new THREE.Vector2(1.0, 0.0);
        uvs[sides.back * verticesPerSide + vertexLocation.topRight] = new THREE.Vector2(1.0, 1.0);
        uvs[sides.back * verticesPerSide + vertexLocation.bottomRight] = new THREE.Vector2(0.0, 1.0);

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

            const epsilon : number = 0.01;

            uvs[sides.right * verticesPerSide + i] = new THREE.Vector2(
                uvs[sides.left * verticesPerSide + i].x > epsilon ? 0.0 : 1.0,
                uvs[sides.left * verticesPerSide + i].y
            );

            uvs[sides.top * verticesPerSide + i] = new THREE.Vector2(
                uvs[sides.bottom * verticesPerSide + i].x,
                uvs[sides.bottom * verticesPerSide + i].y
            );

            uvs[sides.front * verticesPerSide + i] = new THREE.Vector2(
                uvs[sides.back * verticesPerSide + i].x > epsilon ? 0.0 : 1.0,
                uvs[sides.back * verticesPerSide + i].y
            );

        }

        let deltaRelativeToHeight : number = delta / (maxPos.y - minPos.y);

        for (let side : number = 0; side < numSides; ++side)
        {
            let intermediateIdxBL : number = side * verticesPerSide + vertexLocation.bottomLeft;
            let intermediateIdxTL : number = side * verticesPerSide + vertexLocation.topLeft;
            let intermediateIdxTR : number = side * verticesPerSide + vertexLocation.topRight;
            let intermediateIdxBR : number = side * verticesPerSide + vertexLocation.bottomRight;

            let indexBottomLeft : number = data.addVertex(
                positions[intermediateIdxBL], normals[side], uvs[intermediateIdxBL], color, subGeomIdx, deltaRelativeToHeight
            );

            let indexTopLeft : number = data.addVertex(
                positions[intermediateIdxTL], normals[side], uvs[intermediateIdxTL], color, subGeomIdx, deltaRelativeToHeight
            );

            let indexTopRight : number = data.addVertex(
                positions[intermediateIdxTR], normals[side], uvs[intermediateIdxTR], color, subGeomIdx, deltaRelativeToHeight
            );

            let indexBottomRight : number = data.addVertex(
                positions[intermediateIdxBR], normals[side], uvs[intermediateIdxBR], color, subGeomIdx, deltaRelativeToHeight
            );

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

    private addFloor(data : intermediateVertexData, n : node, idx : number, desc : codeMapGeometricDescription)
    {
        let color : number = n.depth % 2 == 0 ? MapColors.even : MapColors.odd;
        let measures : boxMeasures = this.mapNodeToLocalBox(n);

        desc.add(
            new codeMapBuilding(
                idx,
                new THREE.Box3(
                    new THREE.Vector3(measures.x, measures.y, measures.z),
                    new THREE.Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
                ),
                n,
                color
            )
        );

        this.addBoxToVertexData(data, measures, color, idx, 0.0);
    }

    private nodeHasSuitableDeltas(n : node, heightKey : string) : boolean
    {
        if (n.deltas && n.deltas[heightKey])
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    private addBuilding(data : intermediateVertexData, n : node, idx : number, desc : codeMapGeometricDescription, settings : renderSettings) : void
    {
        let measures : boxMeasures = this.mapNodeToLocalBox(n);
        let color : number = this.estimateColorForBuilding(n, settings.colorKey, settings.colorRange);

        let deltaValue : number = 0.0;

        if (settings.renderDeltas && this.nodeHasSuitableDeltas(n, settings.heightKey))
        {
            deltaValue = n.deltas[settings.heightKey];

            if (deltaValue > 0.0)
            {
                measures.height += deltaValue;
            }
        }

        desc.add(
            new codeMapBuilding(
                idx,
                    new THREE.Box3(
                    new THREE.Vector3(measures.x, measures.y, measures.z),
                    new THREE.Vector3(measures.x + measures.width, measures.y + measures.height, measures.z + measures.depth)
                ),
                n,
                color
            )
        );

        this.addBoxToVertexData(data, measures, color, idx, deltaValue);
    }

    private estimateColorForBuilding(n : node, colorKey : string, range : colorRange) : number
    {
        let color : number = MapColors.defaultC;
        
        if (!n.isDelta)
        {
            const val : number = n.attributes[colorKey];
            
            if (val < range.from)
            {
                color = range.flipped ? MapColors.negative : MapColors.positive;
            }
            else if(val > range.to)
            {
                color = range.flipped ? MapColors.positive : MapColors.negative;
            }
            else
            {
                color = MapColors.neutral;
            }
        }

        return color;
    }

    private buildMeshFromIntermediateVertexData(data : intermediateVertexData, material : THREE.Material) : THREE.Mesh
    {
        let numVertices : number = data.positions.length;
        const dimension : number = 3;
        const uvDimension : number = 2;

        let positions : Float32Array = new Float32Array(numVertices * dimension);
        let normals : Float32Array = new Float32Array(numVertices * dimension);
        let uvs : Float32Array = new Float32Array(numVertices * uvDimension);
        let colors : Float32Array = new Float32Array(numVertices * dimension);
        let ids : Float32Array = new Float32Array(numVertices);
        let deltas : Float32Array = new Float32Array(numVertices);

        for (let i : number = 0; i < numVertices; ++i)
        {
            positions[i * dimension + 0] = data.positions[i].x;
            positions[i * dimension + 1] = data.positions[i].y;
            positions[i * dimension + 2] = data.positions[i].z;

            normals[i * dimension + 0] = data.normals[i].x; 
            normals[i * dimension + 1] = data.normals[i].y;
            normals[i * dimension + 2] = data.normals[i].z;

            uvs[i * uvDimension + 0] = data.uvs[i].x;
            uvs[i * uvDimension + 1] = data.uvs[i].y;

            let color : THREE.Vector3 = renderingUtil.colorToVec3(data.colors[i]);

            colors[i * dimension + 0] = color.x;
            colors[i * dimension + 1] = color.y;
            colors[i * dimension + 2] = color.z;

            ids[i] = data.subGeometryIdx[i];
            deltas[i] = data.deltas[i];
        }

        let indices : Uint32Array = new Uint32Array(data.indices.length);

        for (let i : number = 0; i < data.indices.length; ++i)
        {
            indices[i] = data.indices[i];
        }

        let geometry : THREE.BufferGeometry = new THREE.BufferGeometry();

        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, dimension ) );
        geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, dimension ) );
        geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, uvDimension ) );
        geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, dimension ) );
        geometry.addAttribute( 'subGeomIdx' , new THREE.BufferAttribute(ids, 1));
        geometry.addAttribute( 'delta' , new THREE.BufferAttribute(deltas, 1));

        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        return  new THREE.Mesh(geometry, material);
    }
}