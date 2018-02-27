import * as THREE from "three";

import {codeMapShaderStrings} from "./codeMapShaderStrings";
import {geometryGenerator, buildResult} from "./geometryGenerator";
import {codeMapGeometricDescription} from "./codeMapGeometricDescription";
import {intersectionResult} from "./codeMapGeometricDescription";
import {codeMapBuilding} from "./codeMapBuilding";
import {renderingUtil} from "./renderingUtil";
import {node} from "./node";

import {MapColors} from "./renderSettings"
import {renderSettings} from "./renderSettings"

interface threeUniform {
    type : string;
    value : any;
}

interface codeMapLightingParams {
    numHighlights : threeUniform,
    numSelections : threeUniform,
    highlightColor : threeUniform;
    highlightedIndices : threeUniform;
    selectedColor : threeUniform;
    selectedIndices : threeUniform;
    emissive : threeUniform;
    deltaColorPositive : threeUniform;
    deltaColorNegative : threeUniform;
}

export interface mousePos {
    x : number,
    y : number
}

export class CodeMapMesh {
    private threeMesh : THREE.Mesh;
    private material : THREE.ShaderMaterial;
    private geomGen : geometryGenerator;
    private mapGeomDesc : codeMapGeometricDescription;

    private nodes : node[];

    private currentlyHighlighted : codeMapBuilding[] | null;
    private currentlySelected : codeMapBuilding[] | null;

    public settings : renderSettings;

    private lightingParams : codeMapLightingParams = {
        numHighlights : {type : 'f', value : 0.0},
        highlightColor : {type : 'v3', value : renderingUtil.colorToVec3(0x666666)},
        highlightedIndices : {type : 'fv1', value : []},

        numSelections : {type : 'f', value : 0.0},
        selectedColor : {type : 'f', value : renderingUtil.colorToVec3(MapColors.selected)},
        selectedIndices : {type : 'fv1', value : []},

        deltaColorPositive : {type : 'v3', value : renderingUtil.colorToVec3(MapColors.positiveDelta)},
        deltaColorNegative : {type : 'v3', value : renderingUtil.colorToVec3(MapColors.negativeDelta)},

        emissive : {type : 'v3', value : new THREE.Vector3(0.0, 0.0, 0.0)}
    };

    constructor(nodes : node[], settings : renderSettings)
    {
        this.nodes = nodes;

        this.initMaterial(settings);

        this.geomGen = new geometryGenerator();
        let buildRes : buildResult = this.geomGen.build(this.nodes, this.material, settings);

        this.threeMesh = buildRes.mesh;
        this.mapGeomDesc = buildRes.desc;

        this.settings = settings;
    }

    private initMaterial(settings : renderSettings) : void
    {

        //TODO
        if(settings.deltaColorFlipped) {
            this.setDeltaColorsFlipped();
        } else {
            this.setDeltaColorsUnflipped();
        }

        let uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['lights'], this.lightingParams]);

        let shaderCode : codeMapShaderStrings = new codeMapShaderStrings();

        this.material =  new THREE.ShaderMaterial({
            vertexShader: shaderCode.vertexShaderCode,
            fragmentShader: shaderCode.fragmentShaderCode,
            lights : true,
            uniforms : uniforms
        });
    }

    private setDeltaColorsFlipped() {
        this.lightingParams.deltaColorPositive = {type : 'v3', value : renderingUtil.colorToVec3(MapColors.negativeDelta)};
        this.lightingParams.deltaColorNegative = {type : 'v3', value : renderingUtil.colorToVec3(MapColors.positiveDelta)};
    }


    private setDeltaColorsUnflipped() {
        this.lightingParams.deltaColorPositive = {type : 'v3', value : renderingUtil.colorToVec3(MapColors.positiveDelta)};
        this.lightingParams.deltaColorNegative = {type : 'v3', value : renderingUtil.colorToVec3(MapColors.negativeDelta)};
    }

    public getThreeMesh() : THREE.Mesh {
        return this.threeMesh;
    }

    public setHighlighted(buildings : codeMapBuilding[], color? : number)
    {
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.highlightedIndices.value = buildings.map((b : codeMapBuilding) => {return b.id});
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.numHighlights.value = buildings.length;

        if (color)
            this.lightingParams.highlightColor.value = renderingUtil.colorToVec3(color);

        this.currentlyHighlighted = buildings;
    }

    public setSelected(buildings : codeMapBuilding[], color? : number)
    {
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.selectedIndices.value = buildings.map((b : codeMapBuilding) => {return b.id});
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.numSelections.value  = buildings.length;
        
        if (color)
            this.lightingParams.selectedColor.value = renderingUtil.colorToVec3(color);

        this.currentlySelected = buildings;
    }

    public getCurrentlyHighlighted() : codeMapBuilding[] | null
    {
        return this.currentlyHighlighted;
    }

    public getCurrentlySelected() : codeMapBuilding[] | null
    {
        return this.currentlySelected;
    }

    public clearHighlight()
    {
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.numHighlights.value = 0.0;
        this.currentlyHighlighted = null;
    }

    public clearSelected()
    {
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.numSelections.value = 0.0;
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