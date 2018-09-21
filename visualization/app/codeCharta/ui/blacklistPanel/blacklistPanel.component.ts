import {Settings, SettingsService} from "../../core/settings/settings.service";
import "./blacklistPanel.component.scss";

export class BlacklistPanelController {

    constructor(private settingsService: SettingsService) {

    }

}

export const blacklistPanelComponent = {
    selector: "blacklistPanelComponent",
    template: require("./blacklistPanel.component.html"),
    controller: BlacklistPanelController
};



