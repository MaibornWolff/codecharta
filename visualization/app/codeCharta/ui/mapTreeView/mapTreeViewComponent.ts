import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";
import {CodeMap} from "../../core/data/model/CodeMap";

export class MapTreeViewController implements SettingsServiceSubscriber {

    public mapRoot = null;

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService) {

        this.settingsService.subscribe(this);
        this.updateMapRoot(this.settingsService.settings.map);

    }

    onSettingsChanged(s: Settings) {
        this.updateMapRoot(this.settingsService.settings.map);
    }

    private updateMapRoot(map: CodeMap) {
        if(map && map.root) {
            this.mapRoot = map.root;
        }
    }

}

export const mapTreeViewComponent = {
    selector: "mapTreeViewComponent",
    template: require("./mapTreeView.html"),
    controller: MapTreeViewController
};




