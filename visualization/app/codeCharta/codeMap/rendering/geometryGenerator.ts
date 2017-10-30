import * as THREE from "three";
import {node} from "./node.ts";
import {codeMapGeometricDescription} from "./codeMapGeometricDescription.ts";
import {codeMapBuilding} from "./codeMapBuilding.ts";
import {MapColors} from "./renderSettings.ts";
import {colorRange} from "./renderSettings.ts";
import {renderSettings} from "./renderSettings.ts";
import {renderingUtil} from "./renderingUtil.ts";
import {intermediateVertexData} from "./intermediateVertexData.ts";
import {boxGeometryGenerationHelper} from "./boxGeometryGenerationHelper.ts";

export interface boxMeasures {
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

    private mapNodeToLocalBox(n : node) : boxMeasures
    {
        return {
            x : n.x0,
            y : n.z0,
            z : n.y0,
            width : n.width,
            height : Math.max(n.height, 5.0),
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

        boxGeometryGenerationHelper.addBoxToVertexData(data, measures, color, idx, 0.0);
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
        let color : number = this.estimateColorForBuilding(n, settings.colorKey, settings.colorRange, settings.renderDeltas);

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

        boxGeometryGenerationHelper.addBoxToVertexData(data, measures, color, idx, deltaValue);
    }

    private estimateColorForBuilding(n : node, colorKey : string, range : colorRange, deltasEnabled : boolean) : number
    {
        let color : number = MapColors.defaultC;
        
        if (!n.isDelta)
        {

            if (!deltasEnabled)
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
            else{
                color = MapColors.base;
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