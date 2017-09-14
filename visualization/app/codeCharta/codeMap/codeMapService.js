"use strict";

import * as THREE from "three";
import {codeMapMesh} from "./rendering/codeMapMesh";

const mapSize = 500.0;

/**
 * Main service to manage the state of the rendered code map
 */
class CodeMapService {

    /* @ngInject */

    /**
     * @external {Object3D} https://threejs.org/docs/?q=Object3#Reference/Core/Object3D
     * @external {Mesh} https://threejs.org/docs/?q=mesh#Reference/Objects/Mesh
     * @constructor
     * @param {Scope} $rootScope
     * @param {ThreeSceneService} threeSceneService
     * @param {TreeMapService} treeMapService
     * @param {TreeMapService} codeMapAssetService
     * @param {TreeMapService} settingsService
     */
    constructor($rootScope, threeSceneService, treeMapService, codeMapAssetService, settingsService) {
        /**
         *
         * @type {TreeMapService}
         */
        this.treemapService = treeMapService;

        /**
         *
         * @type {ThreeSceneService}
         */
        this.threeSceneService = threeSceneService;

        /**
         * 
         * 
         * @type {codeMapMesh}
         */
        this.mapMesh = null;

        let ctx = this;

        $rootScope.$on("settings-changed", (e, s)=> {
            ctx.applySettings(s);
        });
    }

    /**
     * Applies the given settings and redraws the scene
     * @param {Settings} s
     * @listens {settings-changed}
     */
    applySettings(s) {
        if (s.areaMetric && s.heightMetric && s.colorMetric && s.map && s.neutralColorRange) {
            this.updateMapGeometry(s);
        }

        if(s.scaling && s.scaling.x && s.scaling.y &&s.scaling.z) {
            this.scaleMap(s.scaling.x, s.scaling.y, s.scaling.z);
        }
    }

    updateMapGeometry(s) {
        const padding = 1;

        let nodes = this.treemapService.createTreemapNodes(s.map, mapSize, mapSize, padding, s.areaMetric, s.heightMetric);
        let sorted = nodes.sort((a,b)=>{return b.height - a.height;});
 
        this.mapMesh = new codeMapMesh(sorted, s.colorMetric, s.neutralColorRange, mapSize);

        this.threeSceneService.setMapMesh(this.mapMesh, mapSize);
    }

     /**
     * scales the scene by the given values
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    scaleMap(x, y, z) {
        this.threeSceneService.mapGeometry.scale.x = x;
        this.threeSceneService.mapGeometry.scale.y = y;
        this.threeSceneService.mapGeometry.scale.z = z;

        this.threeSceneService.mapGeometry.position.x = -mapSize / 2.0 * x;
        this.threeSceneService.mapGeometry.position.y = 0.0;
        this.threeSceneService.mapGeometry.position.z = -mapSize / 2.0 * z;

        if (this.threeSceneService.getMapMesh())
            this.threeSceneService.getMapMesh().setScale(x, y, z);
    }
}

export {CodeMapService};