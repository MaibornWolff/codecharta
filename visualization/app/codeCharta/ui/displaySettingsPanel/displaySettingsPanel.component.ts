import {SettingsService} from "../../core/settings/settings.service";
import "./displaySettingsPanel.component.scss";

export class DisplaySettingsPanelController {

    /* @ngInject */
    constructor(
        private settingsService: SettingsService
    ) {
    }

    public changeMargin(){
        this.settingsService.settings.dynamicMargin = false;
        this.settingsService.applySettings();
    }
}

export const displaySettingsPanelComponent = {
    selector: "displaySettingsPanelComponent",
    template: require("./displaySettingsPanel.component.html"),
    controller: DisplaySettingsPanelController
};



