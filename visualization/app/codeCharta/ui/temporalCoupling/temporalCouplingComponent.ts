import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, Edge, CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";

export class TemporalCouplingController implements SettingsServiceSubscriber {

    public  edges: Edge[] = null;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private $scope,
                private settingsService: SettingsService) {

        this.onSettingsChanged(settingsService.settings);
        this.settingsService.subscribe(this);
    }

    onSettingsChanged(s: Settings) {
        this.updateEdges(this.settingsService.settings.map);
    }

    public onResetEdges() {
        var map = this.settingsService.settings.map;
        if (map && map.edges) {
            for (var i = 0; i < this.settingsService.settings.map.edges.length; i++) {
                this.settingsService.settings.map.edges[i].visible = false;
            }
        }
        this.settingsService.applySettings();
    }

    onClickCouple(couple: Edge) {
        this.setNewEdgeVisibilityInSettingsService(this.settingsService.settings.map.edges, couple);
        this.settingsService.applySettings();
    }

    setNewEdgeVisibilityInSettingsService(edges: Edge[], edge: Edge) {
        let coupleIndex = edges.indexOf(edge);
        let oldVisibility = edges[coupleIndex].visible;
        let newVisibility = !(oldVisibility === true);
        this.settingsService.settings.map.edges[coupleIndex].visible = newVisibility;
    }

    updateEdges(map: CodeMap) {
        if (map && map.edges) {
            this.edges = map.edges;

            for (var edge of this.edges) {
                if (edge.visible !== true) {
                    edge.visible = false;
                }
            }

            this.edges = this.edges.filter(
                edge =>
                    edge.attributes.averageRevs >= this.settingsService.settings.minimumAverageRevs &&
                    this.isEdgeVisibleInCodeMap(edge, map)
            );

            if (this.settingsService.settings.intelligentTemporalCouplingFilter) {
                this.edges = this.edges.filter(
                    couple => this.isEligibleEdge(couple)
                );
            }
        }
    }

    isEdgeVisibleInCodeMap(edge, map) {
        var isFromNodeInCodeMap = false;
        var isToNodeInCodeMap = false;

        hierarchy<CodeMapNode>(map.root).leaves().forEach(function (node) {

            if (node.data.path == edge.fromNodeName && node.data.visible) {
                isFromNodeInCodeMap = true;
            }
            if (node.data.path == edge.toNodeName && node.data.visible) {
                isToNodeInCodeMap = true;
            }
        });
        return isFromNodeInCodeMap && isToNodeInCodeMap;
    }

    isEligibleEdge(edge) {

        let nodenameBlacklist = [
            /package-lock\.json/i,
            /package\.json/i,
            /CHANGELOG.*/i,
            /README.*/i,
            /.*\.log/i,
            /gradle\.properties/i,
            /build\.gradle/i,
            /sample1 only leaf/i,
        ];
        let isEligibleEdge = true;

        nodenameBlacklist.forEach(function (re) {

            let isFromNameMatch = edge.fromNodeName.search(re) != -1;
            let isToNodeNameMatch = edge.toNodeName.search(re) != -1;

            if (isFromNameMatch || isToNodeNameMatch) {
                isEligibleEdge = false
            }
        });
        return isEligibleEdge;
    }
}

export const temporalCouplingComponent = {
    selector: "temporalCouplingComponent",
    template: require("./temporalCoupling.html"),
    controller: TemporalCouplingController
};




