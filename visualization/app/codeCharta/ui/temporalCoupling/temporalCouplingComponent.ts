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
        this.updateTemporalCouplingDependencies(this.settingsService.settings.map);
    }

    public onResetDependencies() {
        var map = this.settingsService.settings.map;
        if (map && map.edges) {
            for (var i = 0; i < this.settingsService.settings.map.edges.length; i++) {
                this.settingsService.settings.map.edges[i].visible = false;
            }
        }
        this.settingsService.applySettings();
    }

    onClickCouple(couple: Edge) {
        this.setNewVisibilityInSettingsService(this.settingsService.settings.map.edges, couple);
        this.settingsService.applySettings();
    }

    setNewVisibilityInSettingsService(edges: Edge[], edge: Edge) {
        let coupleIndex = edges.indexOf(edge);
        let oldVisibility = edges[coupleIndex].visible;
        let newVisibility = !(oldVisibility === true);
        this.settingsService.settings.map.edges[coupleIndex].visible = newVisibility;
    }

    private updateTemporalCouplingDependencies(map: CodeMap) {
        if (map && map.edges) {
            this.edges = map.edges;

            for (var couple of this.edges) {
                if (couple.visible !== true) {
                    couple.visible = false;
                }
            }

            this.edges = this.edges.filter(
                couple =>
                    couple.attributes.averageRevs >= this.settingsService.settings.minimumAverageRevs &&
                    this.isCoupleVisibleInCodeMap(couple, map)
            );

            if (this.settingsService.settings.intelligentTemporalCouplingFilter) {
                this.edges = this.edges.filter(
                    couple => this.isEligibleCouple(couple)
                );
            }
        }
    }

    private isCoupleVisibleInCodeMap(couple, map) {
        var isFromNodeInCodeMap = false;
        var isToNodeInCodeMap = false;

        hierarchy<CodeMapNode>(map.root).leaves().forEach(function (node) {

            if (node.data.path == couple.fromNodeName && node.data.visible) {
                isFromNodeInCodeMap = true;
            }
            if (node.data.path == couple.toNodeName && node.data.visible) {
                isToNodeInCodeMap = true;
            }
        });
        return isFromNodeInCodeMap && isToNodeInCodeMap;
    }

    private isEligibleCouple(couple) {

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
        let isEligibleCouple = true;

        nodenameBlacklist.forEach(function (re) {

            let isNodeNameMatch = couple.fromNodeName.search(re) != -1;
            let isDependantNodeNameMatch = couple.toNodeName.search(re) != -1;

            if (isNodeNameMatch || isDependantNodeNameMatch) {
                isEligibleCouple = false
            }
        });
        return isEligibleCouple;
    }
}

export const temporalCouplingComponent = {
    selector: "temporalCouplingComponent",
    template: require("./temporalCoupling.html"),
    controller: TemporalCouplingController
};




