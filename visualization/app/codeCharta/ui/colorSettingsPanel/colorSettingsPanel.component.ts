import {KindOfMap, SettingsService} from "../../core/settings/settings.service";
import "./colorSettingsPanel.component.scss";

export class ColorSettingsPanelController {

    private _deltaMode = KindOfMap.Delta;

    /* @ngInject */
    constructor(
        _settingsService_: SettingsService
    ) {
    }

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



