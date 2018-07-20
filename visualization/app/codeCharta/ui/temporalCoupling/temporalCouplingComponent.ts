import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {IRootScopeService, ITimeoutService} from "angular";
import {CodeMap, CodeMapDependency} from "../../core/data/model/CodeMap";
import {map} from "d3-collection";
import {isBoolean} from "util";

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
        if (this.temporalCoupling && map && map.dependencies && map.dependencies.temporal_coupling) {

            for (var couple of this.temporalCoupling) {
                couple.visible = false;
            }
            this.settingsService.settings.map.dependencies.temporal_coupling = this.temporalCoupling;
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

            /*if(this.settingsService.settings.intelligentTemporalCouplingFilter === true) {
                this.temporalCoupling = this.temporalCoupling.filter(this.isEligibleCouple);
            }*/
            this.temporalCoupling = this.temporalCoupling.filter(
                couple =>
                    couple.averageRevs >= this.settingsService.settings.mininumAverageRevs &&
                    this.isEligibleCouple(couple)
            );
        }
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
        ];
        let isEligibleCouple = true;

        nodenameBlacklist.forEach(function (re) {

            let isNodeNameMatch = couple.nodeFilename.search(re) != -1;
            let isDependantNodeNameMatch = couple.dependantNodeFilename.search(re) != -1;
            let decision = isNodeNameMatch || isDependantNodeNameMatch;

            if (decision) {
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




