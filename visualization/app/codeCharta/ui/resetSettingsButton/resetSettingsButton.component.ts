import {SettingsService} from "../../core/settings/settings.service";
import "./resetSettingsButton.component.scss";
import {ScenarioService} from "../../core/scenario/scenario.service";

export class ResetSettingsButtonController {

    private settingsNames: string = "";

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private scenarioService: ScenarioService
    ) {

    }

    onClick() {
        this.updateSettings(this.settingsNames);
    }

    public updateSettings(settingsList: string = this.settingsNames) {
        settingsList = settingsList.replace(/ /g,"");
        settingsList = settingsList.replace(/\n/g,"");
        let tokens: string[] = settingsList.split(",");

        tokens.forEach((token) => {

            let steps = token.split(".");

            if (steps.length > 1) {

                let writeSettingsPointer = this.settingsService.settings;
                let readSettingsPointer = this.scenarioService.getDefaultScenario().settings;

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
                this.settingsService.settings[token] = this.scenarioService.getDefaultScenario().settings[token];
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



