import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./resetSettingsButton.component.scss";
import {ScenarioService} from "../../core/scenario/scenario.service";

export class ResetSettingsButtonController implements SettingsServiceSubscriber{

    private settingsNames: string = "";

    /* @ngInject */
    constructor(
        private settingsService: SettingsService,
        private scenarioService: ScenarioService
    ) {
        this.onSettingsChanged(this.settingsService.settings, null);
        this.settingsService.subscribe(this);
    }

    onClick() {
        let tokens: string[] = this.settingsNames.split(",");

        tokens.forEach((token)=>{

            let dotSplit = token.split(".");
            //console.log(dotSplit);

            if(dotSplit.length > 1) {

                let pointer = this.settingsService.settings;
                let pointer2 = this.scenarioService.getDefaultScenario().settings;

                dotSplit.forEach((nToken, index) => {
                    if (pointer[nToken] && pointer2[nToken]) {

                        if (index === dotSplit.length - 1) {
                            console.log("setting", nToken);
                            pointer[nToken] = pointer2[nToken];
                        } else {
                            console.log("stepping into ", nToken);
                            pointer = pointer[nToken];
                            pointer2 = pointer2[nToken];
                        }
                    }
                });

            } else {
                console.log("setting", token);
                this.settingsService.settings[token] = this.scenarioService.getDefaultScenario().settings[token];
            }

        });


        this.settingsService.applySettings();

    }

    onSettingsChanged(settings: Settings, event) {

    }

}

export const resetSettingsButtonComponent = {
    selector: "resetSettingsButtonComponent",
    template: require("./resetSettingsButton.component.html"),
    controller: ResetSettingsButtonController,
    bindings: {
        settingsNames: '@'
    }
};



