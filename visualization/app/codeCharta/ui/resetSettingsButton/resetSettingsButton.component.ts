import {SettingsService} from "../../core/settings/settings.service";
import "./resetSettingsButton.component.scss";
import {DataService} from "../../core/data/data.service";

export class ResetSettingsButtonController {

    private settingsNames: string = "";

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private dataService: DataService
    ) {

    }

    onClick() {
        this.updateSettings(this.settingsNames);
    }

    public updateSettings(settingsList: string = this.settingsNames) {
        settingsList = settingsList.replace(/ /g,"");
        settingsList = settingsList.replace(/\n/g,"");
        let tokens: string[] = settingsList.split(",");
        let settings = this.settingsService.settings;
        let defaultSettings = this.settingsService.getDefaultSettings(settings.map, this.dataService.data.metrics);

        tokens.forEach((token) => {
            let steps = token.split(".");

            if (steps.length > 1) {
                steps.forEach((step, index) => {

                    if (settings[step] != null && defaultSettings[step] != null) {

                        if (index === steps.length - 1) {
                            settings[step] = defaultSettings[step];
                        } else {
                            settings = settings[step];
                            defaultSettings = defaultSettings[step];
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



