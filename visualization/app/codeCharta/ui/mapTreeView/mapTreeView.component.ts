import {SettingsServiceSubscriber, SettingsService} from "../../core/settings/settings.service";
import { IRootScopeService } from "angular";
import { CodeMap, Settings } from "../../codeCharta.model";
import { CodeChartaService } from "../../codeCharta.service";

export class MapTreeViewController implements SettingsServiceSubscriber {

    public mapRoot = null;

    /* @ngInject */
    constructor(private settingsService: SettingsService, private codeChartaService: CodeChartaService, private $rootScope: IRootScopeService) {
        SettingsService.subscribe(this.$rootScope, this);
        this.updateMapRoot(this.codeChartaService.getRenderMap());
    }

    public onSettingsChanged(s: Settings) {
        this.updateMapRoot(this.codeChartaService.getRenderMap());
    }

    private updateMapRoot(map: CodeMap) {
        if(map && map.nodes) {
            this.mapRoot = map.nodes;
        }
    }

}

export const mapTreeViewComponent = {
    selector: "mapTreeViewComponent",
    template: require("./mapTreeView.component.html"),
    controller: MapTreeViewController
};




