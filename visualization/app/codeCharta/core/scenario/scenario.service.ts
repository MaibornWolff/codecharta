"use strict";
import {Settings, SettingsService} from "../settings/settings.service";
import {ThreeOrbitControlsService} from "../../ui/codeMap/threeViewer/threeOrbitControlsService";

export interface Scenario {
    name: string;
    settings: Partial<Settings>;
    autoFitCamera: boolean;
}

/**
 * Applies and manages scenarios.
 */
export class ScenarioService {

    private scenarios: Scenario[];
    private calledOnce = false;

    /* ngInject */
    constructor(private settingsService: SettingsService,
                private dataService,
                private threeOrbitControlsService:ThreeOrbitControlsService) {
        this.scenarios = require("./scenarios.json");
    }

    /**
     * Applies a given scenario to the current codecharta session only once.
     * This method remembers how often it was called and applies the scenario only once in session.
     * This method is mainly called by file loading operation in order to keep already changed settings
     * when a new file is loaded.
     * @param {Scenario} scenario
     */
    public applyScenarioOnce(scenario: Scenario) {
        if(!this.calledOnce) {
            this.applyScenario(scenario);
            this.calledOnce = true;
        }
    }

    public applyScenario(scenario: Scenario) {
        const updatedSettingsUsingScenario = this.updateSettingsUsingScenario(this.settingsService.settings, scenario.settings);
        this.settingsService.applySettings(updatedSettingsUsingScenario);
        if(scenario.autoFitCamera){
            setTimeout(() => {
                this.threeOrbitControlsService.autoFitTo();
            },10);
        }
    }

    private updateSettingsUsingScenario(settings: Settings, scenarioSettings: Partial<Settings>): Settings {
        let updatedSettings: Settings = settings;
        if (updatedSettings) {
            for(let key of Object.keys(updatedSettings)) {
                if (scenarioSettings.hasOwnProperty(key)) {
                    if(key == "map") { continue; }

                    if(typeof settings[key] === "object") {
                        updatedSettings[key] = this.updateSettingsUsingScenario(updatedSettings[key], scenarioSettings[key]);
                    } else {
                        updatedSettings[key] = scenarioSettings[key];
                    }
                }
            }
        }
        return updatedSettings;
    }

    public getScenarios(): Scenario[] {
        return this.scenarios.filter(s => this.isScenarioPossible(s, this.dataService._data.metrics));
    }

    public isScenarioPossible(scenario: Scenario, metrics: string[]) {
        if(!scenario || !metrics) {
            return false;
        }
        return (metrics.filter(x => x === scenario.settings.areaMetric).length > 0 &&
        metrics.filter(x => x === scenario.settings.heightMetric).length > 0 &&
        metrics.filter(x => x === scenario.settings.colorMetric).length > 0);
    }

    public getDefaultScenario(): Scenario {
        return this.scenarios.find(s => s.name == "Complexity");
    }

}