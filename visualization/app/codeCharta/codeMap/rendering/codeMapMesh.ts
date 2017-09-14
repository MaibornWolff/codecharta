import * as THREE from "three";

import {codeMapShaderStrings} from "./codeMapShaderStrings";
import {geometryGenerator, buildResult} from "./geometryGenerator";
import {codeMapGeometricDescription} from "./codeMapGeometricDescription";
import {intersectionResult} from "./codeMapGeometricDescription";
import {codeMapBuilding} from "./codeMapBuilding";
import {renderingUtil} from "./renderingUtil";
import {node} from "./node";

interface threeUniform {
    type : string;
    value : any;
}

interface codeMapLightingParams {
    highlightColor : threeUniform;
    highlightColorIdx : threeUniform;
    selectedColor : threeUniform;
    selectedColorIdx : threeUniform;
    emissive : threeUniform;
}

interface mousePos {
    x : number,
    y : number
}

export interface colorRange {
    from : number;
    to : number;
    flipped : boolean;
}

export enum MapColors {
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

export class codeMapMesh {
    private threeMesh : THREE.Mesh;
    private material : THREE.ShaderMaterial;
    private geomGen : geometryGenerator;
    private mapGeomDesc : codeMapGeometricDescription;

    private nodes : node[];

    private currentlyHighlighted : codeMapBuilding;
    private currentlySelected : codeMapBuilding;

    private lightingParams : codeMapLightingParams = {
        highlightColor : {type : 'v3', value : renderingUtil.colorToVec3(0x666666)},
        highlightColorIdx : {type : 'f', value : -1.0},
        selectedColor : {type : 'f', value : renderingUtil.colorToVec3(MapColors.selected)},
        selectedColorIdx : {type : 'f', value : -1.0},
        emissive : {type : 'v3', value : new THREE.Vector3(0.0, 0.0, 0.0)}
    };

    constructor(nodes : node[], colorKey : string, neutralColorRange : colorRange, mapSize : number)
    {
        this.nodes = nodes;

        this.initMaterial();

        this.geomGen = new geometryGenerator();
        let buildRes : buildResult = this.geomGen.build(this.nodes, this.material, colorKey, neutralColorRange, mapSize);

        this.threeMesh = buildRes.mesh;
        this.mapGeomDesc = buildRes.desc;
    }

    private initMaterial() : void
    {
        let uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['lights'], this.lightingParams]);

        let shaderCode : codeMapShaderStrings = new codeMapShaderStrings();

        this.material =  new THREE.ShaderMaterial({
            vertexShader: shaderCode.vertexShaderCode,
            fragmentShader: shaderCode.fragmentShaderCode,
            lights : true,
            uniforms : uniforms
        });
    }

    public getThreeMesh() : THREE.Mesh {
        return this.threeMesh;
    }

    public setHighlighted(building : codeMapBuilding, color? : number)
    {
        this.material.uniforms.highlightColorIdx.value = building.id;

        if (color)
            this.lightingParams.highlightColor.value = renderingUtil.colorToVec3(color);

        this.currentlyHighlighted = building;
    }

    public setSelected(building : codeMapBuilding, color? : number)
    {
        this.lightingParams.selectedColorIdx.value = building.id;
        
        if (color)
            this.lightingParams.selectedColor.value = renderingUtil.colorToVec3(color);

            this.currentlySelected = building;
    }

    public getCurrentlyHighlighted() : codeMapBuilding
    {
        return this.currentlyHighlighted;
    }

    public getCurrentlySelected() : codeMapBuilding
    {
        return this.currentlySelected;
    }

    public clearHighlight()
    {
        this.lightingParams.highlightColorIdx.value = -1.0;
        this.currentlyHighlighted = null;
    }

    public clearSelected()
    {
        this.lightingParams.selectedColorIdx.value = -1.0;
        this.currentlySelected = null;
    }

    public getMeshDescription() : codeMapGeometricDescription
    {
        return this.mapGeomDesc;
    }

    private calculatePickingRay(mouse : mousePos, camera : THREE.Camera) : THREE.Ray
    {

        let ray : THREE.Ray = new THREE.Ray();
        ray.origin.setFromMatrixPosition(camera.matrixWorld);
        ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(ray.origin).normalize();

        return ray;
    }

    public checkMouseRayMeshIntersection(mouse : mousePos, camera : THREE.Camera) : intersectionResult
    {
        let ray : THREE.Ray = this.calculatePickingRay(mouse, camera);
        return this.getMeshDescription().intersect(ray);
    }

    public setScale(x : number, y : number, z : number)
    {
        this.mapGeomDesc.setScales(new THREE.Vector3(x, y, z));
    }
}