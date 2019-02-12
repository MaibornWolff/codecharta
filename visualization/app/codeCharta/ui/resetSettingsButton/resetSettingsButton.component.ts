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
        const tokens: string[] = settingsList.split(",");
        const settings = this.settingsService.settings;
        const defaultSettings = this.settingsService.getDefaultSettings(settings.map, this.dataService.data.metrics);

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
        this.settingsService.onSettingsChanged();
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



