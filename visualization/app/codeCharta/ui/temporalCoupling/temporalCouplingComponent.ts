import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {IRootScopeService, ITimeoutService} from "angular";
import {CodeMap, CodeMapDependency} from "../../core/data/model/CodeMap";

export class TemporalCouplingController implements SettingsServiceSubscriber {

    public temporalCoupling: CodeMapDependency[] = null;

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

        let coupleIndex = this.temporalCoupling.indexOf(couple);

        let oldVisibility = this.settingsService.settings.map.dependencies.temporal_coupling[coupleIndex].visible;
        let newVisibility = !(oldVisibility === true);

        this.temporalCoupling[coupleIndex].visible = newVisibility;
        this.settingsService.settings.map.dependencies.temporal_coupling[coupleIndex].visible = newVisibility;

        this.settingsService.applySettings();

    }

    private updateTemporalCouplingDependencies(map: CodeMap) {
        if (map && map.dependencies && map.dependencies.temporal_coupling) {
            this.temporalCoupling = map.dependencies.temporal_coupling;

            for (var couple of this.temporalCoupling) {
                if (couple.visible !== true) {
                    couple.visible = false;
                }
            }
        }
    }
}

export const temporalCouplingComponent = {
    selector: "temporalCouplingComponent",
    template: require("./temporalCoupling.html"),
    controller: TemporalCouplingController
};




