"use strict";

import {CodeMapMesh} from "./rendering/codeMapMesh";
import {renderSettings} from "./rendering/renderSettings";
import {LabelManager} from "./rendering/labelManager";
import {SettingsServiceSubscriber, Settings, SettingsService} from "../../core/settings/settings.service";
import {node} from "./rendering/node";
import {ArrowManager} from "./rendering/arrowManager";
import {CodeMapDependency} from "../../core/data/model/CodeMap";
import {
    CodeMapBuildingTransition, CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "./codeMap.mouseEvent.service";
import {TreeMapSettings} from "../../core/treemap/treemap.service";

const mapSize = 500.0;

/**
 * Main service to manage the state of the rendered code map
 */
export class CodeMapRenderService implements SettingsServiceSubscriber, CodeMapMouseEventServiceSubscriber {

    public static SELECTOR = "codeMapRenderService";

    private _mapMesh: CodeMapMesh = null;
    private labelManager: LabelManager = null;
    private arrowManager: ArrowManager = null;

    private currentSortedNodes: node[];
    private currentRenderSettings: renderSettings;

    /* @ngInject */
    constructor(private threeSceneService,
                private treeMapService,
                private $rootScope,
                private settingsService: SettingsService) {
        this.settingsService.subscribe(this);
        CodeMapMouseEventService.subscribe($rootScope, this);
    }

    onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {

    }

    get mapMesh(): CodeMapMesh {
        return this._mapMesh;
    }

    onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
        let deps: CodeMapDependency[] = this.settingsService.settings.map.dependencies;

        this.arrowManager.clearArrows();

        if (deps && data.to && this.currentSortedNodes && this.currentRenderSettings && this.settingsService.settings.showDependencies) {
            this.arrowManager.addCodeMapDependenciesFromOriginAsArrows(data.to.node, this.currentSortedNodes, deps, this.currentRenderSettings);
            this.arrowManager.scale(
                this.threeSceneService.mapGeometry.scale.x,
                this.threeSceneService.mapGeometry.scale.y,
                this.threeSceneService.mapGeometry.scale.z,
            );
        }
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

        if (s.areaMetric && s.heightMetric && s.colorMetric && s.map && s.map.root && s.neutralColorRange && s.deltaColorFlipped != undefined) {
            this.updateMapGeometry(s);
        }

        if (s.scaling && s.scaling.x && s.scaling.y && s.scaling.z) {
            this.scaleMap(s.scaling.x, s.scaling.y, s.scaling.z);
        }
    }

    public collectNodesToArray(node: node): node[] {
        let nodes = [node];
        for (let i = 0; i < node.children.length; i++) {
            let collected = this.collectNodesToArray(node.children[i]);
            for (let j = 0; j < collected.length; j++) {
                nodes.push(collected[j]);
            }
        }
        return nodes;
    }

    updateMapGeometry(s: Settings) {

        const treeMapSettings: TreeMapSettings = {
            size: mapSize,
            areaKey: s.areaMetric,
            heightKey: s.heightMetric,
            margin: s.margin
        };

        let nodes: node[] = this.collectNodesToArray(
            this.treeMapService.createTreemapNodes(s.map.root, treeMapSettings)
        );

        console.log(nodes);

        let filtered = nodes.filter(node => node.visible && node.length > 0 && node.width > 0);
        this.currentSortedNodes = filtered.sort((a, b) => {
            return b.height - a.height;
        });
        this.currentRenderSettings = {
            heightKey: s.heightMetric,
            colorKey: s.colorMetric,
            renderDeltas: s.deltas,
            colorRange: s.neutralColorRange,
            mapSize: mapSize,
            deltaColorFlipped: s.deltaColorFlipped
        };

        this.labelManager = new LabelManager(this.threeSceneService.labels);
        this.labelManager.clearLabels();
        this.arrowManager = new ArrowManager(this.threeSceneService.dependencyArrows);
        this.arrowManager.clearArrows();

        for (let i = 0, numAdded = 0; i < this.currentSortedNodes.length && numAdded < s.amountOfTopLabels; ++i) {
            if (this.currentSortedNodes[i].isLeaf) {
                this.labelManager.addLabel(this.currentSortedNodes[i], this.currentRenderSettings);
                ++numAdded;
            }
        }

        this._mapMesh = new CodeMapMesh(this.currentSortedNodes, this.currentRenderSettings);

        this.threeSceneService.setMapMesh(this._mapMesh, mapSize);
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

        if (this.threeSceneService.getMapMesh()) {
            this.threeSceneService.getMapMesh().setScale(x, y, z);
        }

        if (this.labelManager) {
            this.labelManager.scale(x, y, z);
        }

        if (this.arrowManager) {
            this.arrowManager.scale(x, y, z);
        }
    }
}