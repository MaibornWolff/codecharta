"use strict";

import {codeMapMesh} from "./rendering/codeMapMesh.ts";
import {renderSettings} from "./rendering/renderSettings.ts"
import {labelManager} from "./rendering/labelManager.ts"
import {SettingsServiceSubscriber, Settings, SettingsService} from "../core/settings/settingsService.ts";

const mapSize = 500.0;

/**
 * Main service to manage the state of the rendered code map
 */
class CodeMapService implements SettingsServiceSubscriber{

    private mapMesh: codeMapMesh = null;
    private labelManager: labelManager = null;

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
    constructor(
        private threeSceneService,
        private treeMapService,
        private settingsService: SettingsService) {

        this.settingsService.subscribe(this);

    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.applySettings(settings);
    }

    /**
     * Applies the given settings and redraws the scene
     * @param {Settings} s
     * @listens {settings-changed}
     */
    applySettings(s: Settings) {
        if (s.areaMetric && s.heightMetric && s.colorMetric && s.map && s.map.root && s.neutralColorRange) {
            this.updateMapGeometry(s);
        }

        if(s.scaling && s.scaling.x && s.scaling.y &&s.scaling.z) {
            this.scaleMap(s.scaling.x, s.scaling.y, s.scaling.z);
        }
    }

    updateMapGeometry(s) {
        let nodes = this.treeMapService.createTreemapNodes(s.map.root, mapSize, mapSize, s.margin, s.areaMetric, s.heightMetric);
        let sorted = nodes.sort((a,b)=>{return b.height - a.height;});

        let renderSettings: renderSettings  =  {
            heightKey : s.heightMetric,
            colorKey : s.colorMetric,
            renderDeltas : s.deltas,
            colorRange : s.neutralColorRange,
            mapSize : mapSize
        };

        this.threeSceneService.clearLabels();
        this.labelManager = new labelManager(this.threeSceneService.labels);
        
        for (let i=0, numAdded = 0; i < sorted.length && numAdded < s.amountOfTopLabels; ++i)
        {
            if (sorted[i].isLeaf)
            {
                this.labelManager.addLabel(sorted[i], renderSettings);
                ++numAdded;
            }
        }

        this.mapMesh = new codeMapMesh(sorted, renderSettings);

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

        if (this.labelManager)
            this.labelManager.scale(x, y, z);
    }
}

export {CodeMapService};