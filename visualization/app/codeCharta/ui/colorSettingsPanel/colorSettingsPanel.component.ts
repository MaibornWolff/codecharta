import {SettingsService} from "../../core/settings/settings.service";
import "./colorSettingsPanel.component.scss";
import {RenderMode} from "../../codeCharta.model";

export class ColorSettingsPanelController {

    private _deltaMode = RenderMode.Delta;

    /* @ngInject */
    constructor(
        private _settingsService_: SettingsService
    ) {
    }

}

export const colorSettingsPanelComponent = {
    selector: "colorSettingsPanelComponent",
    template: require("./colorSettingsPanel.component.html"),
    controller: ColorSettingsPanelController
};



