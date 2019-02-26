import * as THREE from "three";

import {CodeMapShaderStrings} from "./codeMapShaderStrings";
import {GeometryGenerator, BuildResult} from "./geometryGenerator";
import {CodeMapGeometricDescription} from "./codeMapGeometricDescription";
import {IntersectionResult} from "./codeMapGeometricDescription";
import {CodeMapBuilding} from "./codeMapBuilding";
import {RenderingUtil} from "./renderingUtil";
import {Node} from "./node";

import {MapColors} from "./renderSettings";
import {RenderSettings} from "./renderSettings";

interface ThreeUniform {
    type : string;
    value : any;
}

interface CodeMapLightingParams {
    numHighlights : ThreeUniform;
    numSelections : ThreeUniform;
    highlightColor : ThreeUniform;
    highlightedIndices : ThreeUniform;
    selectedColor : ThreeUniform;
    selectedIndices : ThreeUniform;
    emissive : ThreeUniform;
    deltaColorPositive : ThreeUniform;
    deltaColorNegative : ThreeUniform;
}

export interface MousePos {
    x : number;
    y : number;
}

export class CodeMapMesh {

    public settings : RenderSettings;
    private threeMesh : THREE.Mesh;
    private material : THREE.ShaderMaterial;
    private geomGen : GeometryGenerator;
    private mapGeomDesc : CodeMapGeometricDescription;

    private nodes : Node[];

    private currentlyHighlighted : CodeMapBuilding[] | null;
    private currentlySelected : CodeMapBuilding[] | null;

    private lightingParams : CodeMapLightingParams = {
        numHighlights : {type : "f", value : 0.0},
        highlightColor : {type : "v3", value : RenderingUtil.colorToVec3("#666666")},
        highlightedIndices : {type : "fv1", value : []},

        numSelections : {type : "f", value : 0.0},
        selectedColor : {type : "f", value : RenderingUtil.colorToVec3(MapColors.selected)},
        selectedIndices : {type : "fv1", value : []},

        deltaColorPositive : {type : "v3", value : RenderingUtil.colorToVec3(MapColors.positiveDelta)},
        deltaColorNegative : {type : "v3", value : RenderingUtil.colorToVec3(MapColors.negativeDelta)},

        emissive : {type : "v3", value : new THREE.Vector3(0.0, 0.0, 0.0)}
    };

    constructor(nodes : Node[], settings : RenderSettings)
    {
        this.nodes = nodes;

        this.initMaterial(settings);

        this.geomGen = new GeometryGenerator();
        let buildRes : BuildResult = this.geomGen.build(this.nodes, this.material, settings);

        this.threeMesh = buildRes.mesh;
        this.mapGeomDesc = buildRes.desc;

        this.settings = settings;
    }

    public getThreeMesh() : THREE.Mesh {
        return this.threeMesh;
    }

    public setHighlighted(buildings : CodeMapBuilding[], color? : string)
    {
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.highlightedIndices.value = buildings.map((b : CodeMapBuilding) => {return b.id;});
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.numHighlights.value = buildings.length;

        if (color) {
            this.lightingParams.highlightColor.value = RenderingUtil.colorToVec3(color);
        }

        this.currentlyHighlighted = buildings;
    }

    public setSelected(buildings : CodeMapBuilding[], color? : string)
    {
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.selectedIndices.value = buildings.map((b : CodeMapBuilding) => {return b.id;});
        //noinspection TypeScriptUnresolvedVariable
        this.material.uniforms.numSelections.value  = buildings.length;
        
        if (color) {
            this.lightingParams.selectedColor.value = RenderingUtil.colorToVec3(color);
        }

        this.currentlySelected = buildings;
    }

    public getCurrentlyHighlighted() : CodeMapBuilding[] | null
    {
        return this.currentlyHighlighted;
    }

    public getCurrentlySelected() : CodeMapBuilding[] | null
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

    public getMeshDescription() : CodeMapGeometricDescription
    {
        return this.mapGeomDesc;
    }

    public checkMouseRayMeshIntersection(mouse : MousePos, camera : THREE.Camera) : IntersectionResult
    {
        let ray : THREE.Ray = this.calculatePickingRay(mouse, camera);
        return this.getMeshDescription().intersect(ray);
    }

    public setScale(x : number, y : number, z : number)
    {
        this.mapGeomDesc.setScales(new THREE.Vector3(x, y, z));
    }

    private initMaterial(settings : RenderSettings) : void
    {

        if(settings.deltaColorFlipped) {
            this.setDeltaColorsFlipped();
        } else {
            this.setDeltaColorsUnflipped();
        }

        let uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib["lights"], this.lightingParams]);

        let shaderCode : CodeMapShaderStrings = new CodeMapShaderStrings();

        this.material =  new THREE.ShaderMaterial({
            vertexShader: shaderCode.vertexShaderCode,
            fragmentShader: shaderCode.fragmentShaderCode,
            lights : true,
            uniforms : uniforms
        });
    }

    private setDeltaColorsFlipped() {
        this.lightingParams.deltaColorPositive = {type : "v3", value : RenderingUtil.colorToVec3(MapColors.negativeDelta)};
        this.lightingParams.deltaColorNegative = {type : "v3", value : RenderingUtil.colorToVec3(MapColors.positiveDelta)};
    }


    private setDeltaColorsUnflipped() {
        this.lightingParams.deltaColorPositive = {type : "v3", value : RenderingUtil.colorToVec3(MapColors.positiveDelta)};
        this.lightingParams.deltaColorNegative = {type : "v3", value : RenderingUtil.colorToVec3(MapColors.negativeDelta)};
    }

    private calculatePickingRay(mouse : MousePos, camera : THREE.Camera) : THREE.Ray
    {

        let ray : THREE.Ray = new THREE.Ray();
        ray.origin.setFromMatrixPosition(camera.matrixWorld);
        ray.direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(ray.origin).normalize();

        return ray;
    }
}