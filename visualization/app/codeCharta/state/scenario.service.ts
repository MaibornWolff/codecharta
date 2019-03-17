"use strict";
import {SettingsService} from "./settings.service";
import { RecursivePartial, Settings } from "../codeCharta.model";
import {MetricService} from "./metric.service";

export interface Scenario {
    name: string;
    settings: RecursivePartial<Settings>;
    autoFitCamera: boolean;
}

export class ScenarioService {

    private scenarios: Scenario[];
    private calledOnce = false;

    /* ngInject */
    constructor(private settingsService: SettingsService,
                private metricService: MetricService) {
        this.scenarios = require("../assets/scenarios.json");
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
        const updatedSettingsUsingScenario = this.updateSettingsUsingScenario(this.settingsService.getSettings(), scenario.settings);
        this.settingsService.updateSettings(updatedSettingsUsingScenario);

        /* TODO: autoFit somewhere else
        if(scenario.autoFitCamera){
            setTimeout(() => {
                this.threeOrbitControlsService.autoFitTo();
            },10);
        }*/
    }

    private updateSettingsUsingScenario(settings: Settings, scenarioSettings: RecursivePartial<Settings>): Settings {
        let updatedSettings: Settings = settings;
        if (updatedSettings) {
            for(let key of Object.keys(updatedSettings)) {
                if (scenarioSettings.hasOwnProperty(key)) {
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
        return this.scenarios.filter(s => this.isScenarioPossible(s, this.metricService.getMetrics()));
    }

    public isScenarioPossible(scenario: Scenario, metrics: string[]) {
        if(!scenario || !metrics) {
            return false;
        }
        return (metrics.filter(x => x === scenario.settings.dynamicSettings.areaMetric).length > 0 &&
        metrics.filter(x => x === scenario.settings.dynamicSettings.heightMetric).length > 0 &&
        metrics.filter(x => x === scenario.settings.dynamicSettings.colorMetric).length > 0);
    }

    public getDefaultScenario(): Scenario {
        return this.scenarios.find(s => s.name == "Complexity");
    }

}