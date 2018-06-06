import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {IRootScopeService, ITimeoutService} from "angular";
import {CodeMap, CodeMapDependency} from "../../core/data/model/CodeMap";

export class TemporalCouplingController implements SettingsServiceSubscriber {

    public temporalCoupling: CodeMapDependency[] = null;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private $scope,
                private settingsService: SettingsService,
                private $rootScope: IRootScopeService) {

        this.onSettingsChanged(settingsService.settings);
        this.settingsService.subscribe(this);
    }

    onSettingsChanged(s: Settings) {
        this.updateDependencies(this.settingsService.settings.map);
    }

    private updateDependencies(map: CodeMap) {
        if(map && map.dependencies && map.dependencies.temporal_coupling) {
            this.$timeout(()=>{
                this.temporalCoupling = map.dependencies.temporal_coupling;
            },100);
        }
    }
}

export const temporalCouplingComponent = {
    selector: "temporalCouplingComponent",
    template: require("./temporalCoupling.html"),
    controller: TemporalCouplingController
};




