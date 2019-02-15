import {SettingsService} from "../../core/settings/settings.service";
import "./resetSettingsButton.component.scss";

export class ResetSettingsButtonController {

    private settingsNames: string = "";

    /* @ngInject */
    constructor(
        private settingsService: SettingsService
    ) {

    }

    public onClick() {
        this.updateSettings(this.settingsNames);
    }

    public updateSettings(settingsList: string = this.settingsNames) {
        const sanitizedSettingsList = settingsList.replace(/ /g,"").replace(/\n/g,"");
        const tokens: string[] = sanitizedSettingsList.split(",");
        const settings = this.settingsService.settings;
        const defaultSettings = this.settingsService.getDefaultSettings();

        tokens.forEach((token) => {

            let steps = token.split(".");

            if (steps.length > 1) {

                let writeSettingsPointer = settings;
                let readSettingsPointer = defaultSettings;

                steps.forEach((step, index) => {

                    if (writeSettingsPointer[step] != null && readSettingsPointer[step] != null) {

                        if (index === steps.length - 1) {
                            writeSettingsPointer[step] = readSettingsPointer[step];
                        } else {
                            writeSettingsPointer = writeSettingsPointer[step];
                            readSettingsPointer = readSettingsPointer[step];
                        }
                    }
                });
            } else {
                this.settingsService.settings[token] = defaultSettings[token];
            }
        });
        this.settingsService.applySettings();
    }
}

export const resetSettingsButtonComponent = {
    selector: "resetSettingsButtonComponent",
    template: require("./resetSettingsButton.component.html"),
    controller: ResetSettingsButtonController,
    bindings: {
        settingsNames: "@"
    }
};



