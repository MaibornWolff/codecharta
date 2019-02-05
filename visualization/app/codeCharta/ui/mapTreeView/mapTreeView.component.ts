import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {CodeMap} from "../../core/data/model/CodeMap";

export class MapTreeViewController implements SettingsServiceSubscriber {

    public mapRoot = null;

    /* @ngInject */
    constructor(private settingsService: SettingsService) {

        this.settingsService.subscribe(this);
        this.updateMapRoot(this.settingsService.settings.map);

    }

    public onSettingsChanged(s: Settings) {
        this.updateMapRoot(this.settingsService.settings.map);
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




