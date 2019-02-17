"use strict";

import {CodeMapMesh} from "./rendering/codeMapMesh";
import {RenderSettings} from "./rendering/renderSettings";
import {KindOfMap, Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {Node} from "./rendering/node";
import {Edge} from "../../core/data/model/CodeMap";
import {
    CodeMapBuildingTransition,
    CodeMapMouseEventService,
    CodeMapMouseEventServiceSubscriber
} from "./codeMap.mouseEvent.service";
import {TreeMapService, TreeMapSettings} from "../../core/treemap/treemap.service";
import {CodeMapBuilding} from "./rendering/codeMapBuilding";
import {CodeMapUtilService} from "./codeMap.util.service";
import {CodeMapLabelService} from "./codeMap.label.service";
import {ThreeSceneService} from "./threeViewer/threeSceneService";
import {CodeMapArrowService} from "./codeMap.arrow.service";

const MAP_SIZE = 500.0;

/**
 * Main service to manage the state of the rendered code map
 */
export class CodeMapRenderService implements SettingsServiceSubscriber, CodeMapMouseEventServiceSubscriber {

    get mapMesh(): CodeMapMesh {
        return this._mapMesh;
    }

    public static SELECTOR = "codeMapRenderService";

    public currentSortedNodes: Node[];

    private _mapMesh: CodeMapMesh = null;
    private currentRenderSettings: RenderSettings;
    private visibleEdges: Edge[];

    /* @ngInject */
    constructor(
        private threeSceneService: ThreeSceneService,
        private treeMapService: TreeMapService,
        private $rootScope,
        private settingsService: SettingsService,
        private codeMapUtilService: CodeMapUtilService,
        private codeMapLabelService: CodeMapLabelService,
        private codeMapArrowService: CodeMapArrowService
    ) {
        this.settingsService.subscribe(this);
        CodeMapMouseEventService.subscribe(this.$rootScope, this);
    }

    public onBuildingRightClicked(building: CodeMapBuilding, x: number, y: number, event: angular.IAngularEvent) {
        // unused
    }

    public onBuildingHovered(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
        // unused
    }

    public onBuildingSelected(data: CodeMapBuildingTransition, event: angular.IAngularEvent) {
        // unused
    }

    public onSettingsChanged(settings: Settings, event: Event) {
        this.applySettings(settings);
    }

    /**
     * Applies the given settings and redraws the scene
     * @param {Settings} s
     * @listens {settings-changed}
     */
    public applySettings(s: Settings) {

        if (s.areaMetric && s.heightMetric && s.colorMetric && s.map && s.map.nodes && s.neutralColorRange && s.deltaColorFlipped != undefined && s.invertHeight != undefined) {
            this.updateMapGeometry(s);
        }

        if (s.scaling && s.scaling.x && s.scaling.y && s.scaling.z) {
            this.scaleMap(s.scaling.x, s.scaling.y, s.scaling.z);
        }
    }

    public collectNodesToArray(node: Node): Node[] {
        let nodes = [node];
        for (let i = 0; i < node.children.length; i++) {
            let collected = this.collectNodesToArray(node.children[i]);
            for (let j = 0; j < collected.length; j++) {
                nodes.push(collected[j]);
            }
        }
        return nodes;
    }

    public updateMapGeometry(s: Settings) {

        this.visibleEdges = this.getVisibleEdges(s);

        const treeMapSettings: TreeMapSettings = {
            size: MAP_SIZE,
            areaKey: s.areaMetric,
            heightKey: s.heightMetric,
            margin: s.margin,
            invertHeight: s.invertHeight,
            visibleEdges: this.visibleEdges,
            searchedNodePaths: s.searchedNodePaths,
            blacklist: s.blacklist,
            fileName: s.map.fileName,
            searchPattern: s.searchPattern,
            hideFlatBuildings: s.hideFlatBuildings,
            markedPackages: s.markedPackages,
        };

        this.showAllOrOnlyFocusedNode(s);

        let nodes: Node[] = this.collectNodesToArray(
            this.treeMapService.createTreemapNodes(s.map.nodes, treeMapSettings, s.map.edges)
        );

        let filtered = nodes.filter(
            node => node.visible && node.length > 0 && node.width > 0
        );
        this.currentSortedNodes = filtered.sort((a, b) => {
            return b.height - a.height;
        });

        this.currentRenderSettings = {
            heightKey: s.heightMetric,
            colorKey: s.colorMetric,
            renderDeltas: s.mode == KindOfMap.Delta,
            hideFlatBuildings: s.hideFlatBuildings,
            colorRange: s.neutralColorRange,
            mapSize: MAP_SIZE,
            deltaColorFlipped: s.deltaColorFlipped,
            whiteColorBuildings: s.whiteColorBuildings
        };

        this.setLabels(s);
        this.setArrows(s);

        this._mapMesh = new CodeMapMesh(
            this.currentSortedNodes,
            this.currentRenderSettings
        );
        this.threeSceneService.setMapMesh(this._mapMesh, MAP_SIZE);
    }

    /**
     * scales the scene by the given values
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    public scaleMap(x, y, z) {
        this.threeSceneService.mapGeometry.scale.x = x;
        this.threeSceneService.mapGeometry.scale.y = y;
        this.threeSceneService.mapGeometry.scale.z = z;

        this.threeSceneService.mapGeometry.position.x = -MAP_SIZE / 2.0 * x;
        this.threeSceneService.mapGeometry.position.y = 0.0;
        this.threeSceneService.mapGeometry.position.z = -MAP_SIZE / 2.0 * z;

        if (this.threeSceneService.getMapMesh()) {
            this.threeSceneService.getMapMesh().setScale(x, y, z);
        }

        if (this.codeMapLabelService) {
            this.codeMapLabelService.scale(x, y, z);
        }

        if (this.codeMapArrowService) {
            this.codeMapArrowService.scale(x, y, z);
        }
    }

    private setLabels(s: Settings) {
        this.codeMapLabelService.clearLabels();
        for (
            let i = 0, numAdded = 0;
            i < this.currentSortedNodes.length &&
            numAdded < s.amountOfTopLabels;
            ++i
        ) {
            if (this.currentSortedNodes[i].isLeaf) {
                this.codeMapLabelService.addLabel(
                    this.currentSortedNodes[i],
                    this.currentRenderSettings
                );
                ++numAdded;
            }
        }
    }

    private setArrows(s: Settings) {
        this.codeMapArrowService.clearArrows();
        if (this.visibleEdges.length > 0 && s.enableEdgeArrows) {
            this.showCouplingArrows(this.visibleEdges);
        }
    }

    private showAllOrOnlyFocusedNode(s: Settings) {
        if (s.focusedNodePath) {
            const focusedNode = this.codeMapUtilService.getAnyCodeMapNodeFromPath(
                s.focusedNodePath
            );
            this.treeMapService.setVisibilityOfNodeAndDescendants(
                s.map.nodes,
                false
            );
            this.treeMapService.setVisibilityOfNodeAndDescendants(
                focusedNode,
                true
            );
        } else {
            this.treeMapService.setVisibilityOfNodeAndDescendants(
                s.map.nodes,
                true
            );
        }
    }

    private getVisibleEdges(s: Settings) {
        return s.map && s.map.edges
            ? s.map.edges.filter(edge => edge.visible === true)
            : [];
    }

    private showCouplingArrows(deps: Edge[]) {
        this.codeMapArrowService.clearArrows();

        if (deps && this.currentRenderSettings) {
            this.codeMapArrowService.addEdgeArrows(
                this.currentSortedNodes,
                deps,
                this.currentRenderSettings
            );
            this.codeMapArrowService.scale(
                this.threeSceneService.mapGeometry.scale.x,
                this.threeSceneService.mapGeometry.scale.y,
                this.threeSceneService.mapGeometry.scale.z
            );
        }
    }

}
