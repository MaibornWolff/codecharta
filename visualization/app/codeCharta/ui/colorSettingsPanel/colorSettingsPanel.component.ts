import {KindOfMap, SettingsService} from "../../core/settings/settings.service";
import "./colorSettingsPanel.component.scss";

export class ColorSettingsPanelController {

    private deltaMode = KindOfMap.Delta;

    /* @ngInject */
    constructor(
        private settingsService: SettingsService
    ) {
    }

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



