import {SettingsServiceSubscriber, SettingsService, Settings} from "../../core/settings/settings.service";

export class EdgesController implements SettingsServiceSubscriber {

    /* @ngInject */
    constructor(private settingsService: SettingsService) {

        this.onSettingsChanged(settingsService.settings);
        this.settingsService.subscribe(this);
    }

    onSettingsChanged(s: Settings) {
    }
}

export const edgesComponent = {
    selector: "edgesComponent",
    template: require("./edges.html"),
    controller: EdgesController
};




