import {DataServiceSubscriber, DataService, DataModel} from "../../core/data/data.service";
import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";
import {ITimeoutService} from "angular";

export class MapTreeViewController implements DataServiceSubscriber, SettingsServiceSubscriber {

    /* @ngInject */
    constructor(private $timeout: ITimeoutService,
                private settingsService: SettingsService,
                private dataService: DataService,
                private $element: Element) {

        this.settingsService.subscribe(this);

        this.dataService.subscribe(this);

    }

    $postLink() {
    }

    onDataChanged(data: DataModel) {

    }

    onSettingsChanged(s: Settings) {

    }

}

export const mapTreeViewComponent = {
    selector: "mapTreeViewComponent",
    template: require("./mapTreeView.html"),
    controller: MapTreeViewController
};




