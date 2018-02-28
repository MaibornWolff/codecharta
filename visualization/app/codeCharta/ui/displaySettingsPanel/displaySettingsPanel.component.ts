import {SettingsService} from "../../core/settings/settings.service";
import "./displaySettingsPanel.component.scss";

export class DisplaySettingsPanelController {

    /* @ngInject */
    constructor(
        private settingsService: SettingsService
    ) {
    }

}

export const displaySettingsPanelComponent = {
    selector: "displaySettingsPanelComponent",
    template: require("./displaySettingsPanel.component.html"),
    controller: DisplaySettingsPanelController
};



