import * as THREE from "three";

import {codeMapShaderStrings} from "./codeMapShaderStrings";
import {geometryGenerator, buildResult} from "./geometryGenerator";
import {codeMapGeometricDescription} from "./codeMapGeometricDescription";
import {node} from "./node";

export class codeMapMesh {
    private threeMesh : THREE.Mesh;
    private material : THREE.ShaderMaterial;
    private geomGen : geometryGenerator;
    private mapGeom : codeMapGeometricDescription;

    private nodes : node[];

    constructor(nodes : node[])
    {
        this.nodes = nodes;

        this.initMaterial();

        this.geomGen = new geometryGenerator();
        let buildRes : buildResult = this.geomGen.build(this.nodes, this.material);

        this.threeMesh = buildRes.mesh;
        this.mapGeom = buildRes.desc;
    }

    private initMaterial() : void
    {
        let uniforms = THREE.UniformsUtils.merge(
            [
                THREE.UniformsLib['lights'],
                {
                    highlightColor : {type : 'v3', value : new THREE.Vector3(1.0, 0.0, 0.0)},
                    highlightColorIdx : {type : 'f', value : -1.0}
                }
            ]
        )

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
}