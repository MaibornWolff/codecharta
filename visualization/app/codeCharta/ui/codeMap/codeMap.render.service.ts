"use strict";

import {CodeMapMesh} from "./rendering/codeMapMesh";
import {renderSettings} from "./rendering/renderSettings";
import {LabelManager} from "./rendering/labelManager";
import {KindOfMap, Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {node} from "./rendering/node";
import {ArrowManager} from "./rendering/arrowManager";
import {Edge} from "../../core/data/model/CodeMap";
import {
    CodeMapBuildingTransition,
    CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "./codeMap.mouseEvent.service";
import {TreeMapSettings} from "../../core/treemap/treemap.service";
import {codeMapBuilding} from "./rendering/codeMapBuilding";
import {CodeMapUtilService} from "./codeMap.util.service";
import * as d3 from "d3";

const mapSize = 500.0;

/**
 * Main service to manage the state of the rendered code map
 */
export class CodeMapRenderService implements SettingsServiceSubscriber, CodeMapMouseEventServiceSubscriber {

    public static SELECTOR = "codeMapRenderService";

    private _mapMesh: CodeMapMesh = null;
    private labelManager: LabelManager = null;
    private arrowManager: ArrowManager = null;

    public currentSortedNodes: node[];
    private currentRenderSettings: renderSettings;
    private visibleEdges: Edge[];

    /* @ngInject */
    constructor(private threeSceneService,
                private treeMapService,
                private $rootScope,
                private settingsService: SettingsService,
                private codeMapUtilService: CodeMapUtilService) {
        this.settingsService.subscribe(this);
        CodeMapMouseEventService.subscribe($rootScope, this);
    }

    onBuildingRightClicked(building: codeMapBuilding, x: number, y: number, event: angular.IAngularEvent) {

    }

    onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {

    }

    get mapMesh(): CodeMapMesh {
        return this._mapMesh;
    }

    onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {

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

        if (s.areaMetric && s.heightMetric && s.colorMetric && s.map && s.map.root && s.neutralColorRange && s.deltaColorFlipped != undefined && s.invertHeight != undefined) {
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

        this.visibleEdges = this.getVisibleEdges(s);

        const treeMapSettings: TreeMapSettings = {
            size: mapSize,
            areaKey: s.areaMetric,
            heightKey: s.heightMetric,
            margin: s.margin,
            invertHeight: s.invertHeight,
            visibleEdges: this.visibleEdges,
            searchedNodePaths: s.searchedNodePaths,
            blacklist: s.blacklist,
            fileName: s.map.fileName,
            searchPattern: s.searchPattern,
        };

        this.showAllOrOnlyFocusedNode(s);

        let nodes: node[] = this.collectNodesToArray(
            this.treeMapService.createTreemapNodes(s.map.root, treeMapSettings, s.map.edges)
        );

        let filtered = nodes.filter(node => node.visible && node.length > 0 && node.width > 0);
        this.currentSortedNodes = filtered.sort((a, b) => {
            return b.height - a.height;
        });

        this.currentRenderSettings = {
            heightKey: s.heightMetric,
            colorKey: s.colorMetric,
            renderDeltas: s.mode == KindOfMap.Delta,
            enableFlatBuildingsToBeGrey: s.enableFlatBuildingsToBeGrey,
            colorRange: s.neutralColorRange,
            mapSize: mapSize,
            deltaColorFlipped: s.deltaColorFlipped
        };

        this.setLabels(s);
        this.setArrows(s);

        this._mapMesh = new CodeMapMesh(this.currentSortedNodes, this.currentRenderSettings);
        this.threeSceneService.setMapMesh(this._mapMesh, mapSize);
    }

    private setLabels(s: Settings) {
        this.labelManager = new LabelManager(this.threeSceneService.labels);
        this.labelManager.clearLabels();
        for (let i = 0, numAdded = 0; i < this.currentSortedNodes.length && numAdded < s.amountOfTopLabels; ++i) {
            if (this.currentSortedNodes[i].isLeaf) {
                this.labelManager.addLabel(this.currentSortedNodes[i], this.currentRenderSettings);
                ++numAdded;
            }
        }
    }

    private setArrows(s: Settings) {
        this.arrowManager = new ArrowManager(this.threeSceneService.edgeArrows);
        this.arrowManager.clearArrows();
        if (this.visibleEdges.length > 0 && s.enableEdgeArrows) {
            this.showCouplingArrows(this.visibleEdges);
        }
    }

    private showAllOrOnlyFocusedNode(s: Settings) {
        if (s.focusedNodePath) {
            const focusedNode = this.codeMapUtilService.getAnyCodeMapNodeFromPath(s.focusedNodePath);
            this.treeMapService.setVisibilityOfNodeAndDescendants(s.map.root, false);
            this.treeMapService.setVisibilityOfNodeAndDescendants(focusedNode, true);
        } else {
            this.treeMapService.setVisibilityOfNodeAndDescendants(s.map.root, true);
        }
    }

    private getVisibleEdges(s: Settings) {
        return (s.map && s.map.edges) ? s.map.edges.filter(edge => edge.visible === true) : [];
    }

    private showCouplingArrows(deps: Edge[]) {
        this.arrowManager.clearArrows();

        if (deps && this.currentRenderSettings) {
            this.arrowManager.addEdgeArrows(this.currentSortedNodes, deps, this.currentRenderSettings);
            this.arrowManager.scale(
                this.threeSceneService.mapGeometry.scale.x,
                this.threeSceneService.mapGeometry.scale.y,
                this.threeSceneService.mapGeometry.scale.z,
            );
        }
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