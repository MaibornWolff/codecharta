import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap, CodeMapDependency, CodeMapNode} from "../../core/data/model/CodeMap";
import {hierarchy} from "d3-hierarchy";

export class TemporalCouplingController implements SettingsServiceSubscriber {

    public  temporalCoupling: CodeMapDependency[] = null;

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
        if (map && map.dependencies && map.dependencies.temporal_coupling) {

            for (var i = 0; i < this.settingsService.settings.map.dependencies.temporal_coupling.length; i++) {
                this.settingsService.settings.map.dependencies.temporal_coupling[i].visible = false;
            }
        }
        this.settingsService.applySettings();
    }

    onClickCouple(couple: CodeMapDependency) {
        this.setNewVisibilityInSettingsService(this.settingsService.settings.map.dependencies.temporal_coupling, couple);
        this.settingsService.applySettings();
    }

    setNewVisibilityInSettingsService(deps: CodeMapDependency[], couple: CodeMapDependency) {
        let coupleIndex = deps.indexOf(couple);
        let oldVisibility = deps[coupleIndex].visible;
        let newVisibility = !(oldVisibility === true);
        this.settingsService.settings.map.dependencies.temporal_coupling[coupleIndex].visible = newVisibility;
    }

    private updateTemporalCouplingDependencies(map: CodeMap) {
        if (map && map.dependencies && map.dependencies.temporal_coupling) {
            this.temporalCoupling = map.dependencies.temporal_coupling;

            for (var couple of this.temporalCoupling) {
                if (couple.visible !== true) {
                    couple.visible = false;
                }
            }

            this.temporalCoupling = this.temporalCoupling.filter(
                couple =>
                    couple.averageRevs >= this.settingsService.settings.minimumAverageRevs &&
                    this.isCoupleVisibleInCodeMap(couple, map)
            );

            if (this.settingsService.settings.intelligentTemporalCouplingFilter) {
                this.temporalCoupling = this.temporalCoupling.filter(
                    couple => this.isEligibleCouple(couple)
                );
            }
        }
    }

    private isCoupleVisibleInCodeMap(couple, map) {
        var isNodeInCodeMap = false;
        var isDependantNodeInCodeMap = false;

        hierarchy<CodeMapNode>(map.root).leaves().forEach(function (node) {

            if (node.data.path == couple.node && node.data.visible) {
                isNodeInCodeMap = true;
            }
            if (node.data.path == couple.dependantNode && node.data.visible) {
                isDependantNodeInCodeMap = true;
            }
        });
        return isNodeInCodeMap && isDependantNodeInCodeMap;
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

            let isNodeNameMatch = couple.nodeFilename.search(re) != -1;
            let isDependantNodeNameMatch = couple.dependantNodeFilename.search(re) != -1;

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




