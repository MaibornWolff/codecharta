import {KindOfMap, SettingsService} from "../../core/settings/settings.service";
import "./colorSettingsPanel.component.scss";

export class ColorSettingsPanelController {

    private _deltaMode = KindOfMap.Delta;
    private _settingsService: SettingsService;

    /* @ngInject */
    constructor(
        settingsService: SettingsService
    ) {
        this._settingsService = settingsService;
    }

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



