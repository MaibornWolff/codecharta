import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {IRootScopeService, ITimeoutService} from "angular";
import {CodeMap, CodeMapDependency} from "../../core/data/model/CodeMap";

export class TemporalCouplingController implements SettingsServiceSubscriber {

    public temporalCoupling: CodeMapDependency[] = null;
    public temporalCouplingCheckbox: boolean[] = [];

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private $scope,
                private settingsService: SettingsService) {

        this.onSettingsChanged(settingsService.settings);
        this.settingsService.subscribe(this);
        this.setInitialTemporalCouplingCheckbox();
    }

    onSettingsChanged(s: Settings) {
        this.updateTemporalCouplingDependencies(this.settingsService.settings.map);
    }

    onClickCouple(couple: CodeMapDependency, clickByCheckbox: boolean) {

        if (!clickByCheckbox) {
            let index = this.temporalCoupling.indexOf(couple);
            this.temporalCouplingCheckbox[index] = !this.temporalCouplingCheckbox[index];
        }

        this.removeOrPushCoupleFromList(this.settingsService.settings.emphasizedDependencies, couple);
        this.settingsService.applySettings();
    }

    private removeOrPushCoupleFromList(emphasizedNodes, couple) {
        if (emphasizedNodes.includes(couple)) {
            var index = emphasizedNodes.indexOf(couple);
            if (index > -1) {
                emphasizedNodes.splice(index, 1);
            }
        } else {
            emphasizedNodes.push(couple);
        }
    }

    private updateTemporalCouplingDependencies(map: CodeMap) {
        if(map && map.dependencies && map.dependencies.temporal_coupling) {
            this.$timeout(()=>{
                this.temporalCoupling = map.dependencies.temporal_coupling;
            },100);
        }
    }

    private setInitialTemporalCouplingCheckbox() {
        for (var couple in this.temporalCoupling) {
            this.temporalCouplingCheckbox.push(false);
        }
    }


}

export const temporalCouplingComponent = {
    selector: "temporalCouplingComponent",
    template: require("./temporalCoupling.html"),
    controller: TemporalCouplingController
};




