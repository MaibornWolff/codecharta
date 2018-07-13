import * as THREE from "three";
import {node} from "./node";
import {codeMapGeometricDescription} from "./codeMapGeometricDescription";
import {codeMapBuilding} from "./codeMapBuilding";
import {getFloorGradient, MapColors} from "./renderSettings";
import {colorRange} from "./renderSettings";
import {renderSettings} from "./renderSettings";
import {renderingUtil} from "./renderingUtil";
import {intermediateVertexData} from "./intermediateVertexData";
import {boxGeometryGenerationHelper} from "./boxGeometryGenerationHelper";

export interface boxMeasures {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    depth: number;
}

export interface buildResult {
    mesh: THREE.Mesh;
    desc: codeMapGeometricDescription;
}

export class geometryGenerator {

    private static MINIMAL_BUILDING_HEIGHT = 1.0;

    private floorGradient: number[];

    constructor() {
    }

    public build(nodes: node[], material: THREE.Material, settings: renderSettings): buildResult {
        let data: intermediateVertexData = new intermediateVertexData();
        let desc: codeMapGeometricDescription = new codeMapGeometricDescription(settings.mapSize);

        this.floorGradient = getFloorGradient(nodes);

        for (let i: number = 0; i < nodes.length; ++i) {
            let n: node = nodes[i];

            if (!n.isLeaf) {
                this.addFloor(data, n, i, desc, settings);
            }
            else {
                this.addBuilding(data, n, i, desc, settings);
            }
        }

        return {
            mesh: this.buildMeshFromIntermediateVertexData(data, material),
            desc: desc
        };
    }

    private mapNodeToLocalBox(n: node): boxMeasures {
        return {
            x: n.x0,
            y: n.z0,
            z: n.y0,
            width: n.width,
            height: n.height,
            depth: n.length
        };
    }

    private ensureMinHeightIfUnlessDeltaNegative(x: number, d: number): number {
        if (d <= 0) {
            return x;
        }
        return Math.max(x, geometryGenerator.MINIMAL_BUILDING_HEIGHT);
    }

    private addFloor(data: intermediateVertexData, n: node, idx: number, desc: codeMapGeometricDescription, settings: renderSettings) {
        //let color: number = ((n.markingColor? n.markingColor  & (n.depth % 2 === 0?0xdddddd:0xffffff): this.floorGradient[n.depth]));
        let color: number = (
            n.markingColor ? n.markingColor & (n.depth % 2 === 0 ? 0xdddddd : 0xffffff) :
                this.floorGradient[n.depth]
        );
        let measures: boxMeasures = this.mapNodeToLocalBox(n);

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

    private nodeHasSuitableDeltas(n: node, heightKey: string): boolean {
        if (n.deltas && n.deltas[heightKey]) {
            return true;
        }
        else {
            return false;
        }
    }

    private addBuilding(data: intermediateVertexData, n: node, idx: number, desc: codeMapGeometricDescription, settings: renderSettings): void {
        let measures: boxMeasures = this.mapNodeToLocalBox(n);
        measures.height = this.ensureMinHeightIfUnlessDeltaNegative(n.height, n.heightDelta);

        let color: number = this.estimateColorForBuilding(n, settings.colorKey, settings.colorRange, settings.renderDeltas);

        let renderDelta: number = 0.0;

        if (settings.renderDeltas && this.nodeHasSuitableDeltas(n, settings.heightKey) && n.heightDelta) {
            renderDelta = n.heightDelta; //set the transformed render delta

            if (renderDelta < 0) {
                measures.height += Math.abs(renderDelta);
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

        boxGeometryGenerationHelper.addBoxToVertexData(data, measures, color, idx, renderDelta);
    }

    private estimateColorForBuilding(n: node, colorKey: string, range: colorRange, deltasEnabled: boolean): number {
        let color: number = MapColors.defaultC;

        if (!deltasEnabled) {
            const val: number = n.attributes[colorKey];

            if (val === undefined || val === null) {
                color = MapColors.base;
            }
            else if (val < range.from) {
                color = range.flipped ? MapColors.negative : MapColors.positive;
            }
            else if (val > range.to) {
                color = range.flipped ? MapColors.positive : MapColors.negative;
            }
            else {
                color = MapColors.neutral;
            }

        }
        else {
            color = MapColors.base;
        }

        return color;
    }

    private buildMeshFromIntermediateVertexData(data: intermediateVertexData, material: THREE.Material): THREE.Mesh {
        let numVertices: number = data.positions.length;
        const dimension: number = 3;
        const uvDimension: number = 2;

        let positions: Float32Array = new Float32Array(numVertices * dimension);
        let normals: Float32Array = new Float32Array(numVertices * dimension);
        let uvs: Float32Array = new Float32Array(numVertices * uvDimension);
        let colors: Float32Array = new Float32Array(numVertices * dimension);
        let ids: Float32Array = new Float32Array(numVertices);
        let deltas: Float32Array = new Float32Array(numVertices);

        for (let i: number = 0; i < numVertices; ++i) {
            positions[i * dimension + 0] = data.positions[i].x;
            positions[i * dimension + 1] = data.positions[i].y;
            positions[i * dimension + 2] = data.positions[i].z;

            normals[i * dimension + 0] = data.normals[i].x;
            normals[i * dimension + 1] = data.normals[i].y;
            normals[i * dimension + 2] = data.normals[i].z;

            uvs[i * uvDimension + 0] = data.uvs[i].x;
            uvs[i * uvDimension + 1] = data.uvs[i].y;

            let color: THREE.Vector3 = renderingUtil.colorToVec3(data.colors[i]);

            colors[i * dimension + 0] = color.x;
            colors[i * dimension + 1] = color.y;
            colors[i * dimension + 2] = color.z;

            ids[i] = data.subGeometryIdx[i];
            deltas[i] = data.deltas[i];
        }

        let indices: Uint32Array = new Uint32Array(data.indices.length);

        for (let i: number = 0; i < data.indices.length; ++i) {
            indices[i] = data.indices[i];
        }

        let geometry: THREE.BufferGeometry = new THREE.BufferGeometry();

        geometry.addAttribute("position", new THREE.BufferAttribute(positions, dimension));
        geometry.addAttribute("normal", new THREE.BufferAttribute(normals, dimension));
        geometry.addAttribute("uv", new THREE.BufferAttribute(uvs, uvDimension));
        geometry.addAttribute("color", new THREE.BufferAttribute(colors, dimension));
        geometry.addAttribute("subGeomIdx", new THREE.BufferAttribute(ids, 1));
        geometry.addAttribute("delta", new THREE.BufferAttribute(deltas, 1));

        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        return new THREE.Mesh(geometry, material);
    }
}