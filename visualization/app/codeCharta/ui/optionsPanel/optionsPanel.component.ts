import {SettingsService} from "../../core/settings/settings.service";
import "./optionsPanel.component.scss";

export class OptionsPanelController {

    private _settingsService: SettingsService;

    /* @ngInject */
    constructor(
        settingsService: SettingsService
    ) {
        this._settingsService = settingsService;
    }

}

export const optionsPanelComponent = {
    selector: "optionsPanelComponent",
    template: require("./optionsPanel.component.html"),
    controller: OptionsPanelController
};



