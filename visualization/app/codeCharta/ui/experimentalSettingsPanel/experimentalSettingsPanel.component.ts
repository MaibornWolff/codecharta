import {SettingsService} from "../../core/settings/settings.service";
import "./experimentalSettingsPanel.component.scss";

export class ExperimentalSettingsPanelController {

    /* @ngInject */
    constructor(
        private settingsService: SettingsService
    ) {
    }

}

export const experimentalSettingsPanelComponent = {
    selector: "experimentalSettingsPanelComponent",
    template: require("./experimentalSettingsPanel.component.html"),
    controller: ExperimentalSettingsPanelController
};



