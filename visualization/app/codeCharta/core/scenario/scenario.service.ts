"use strict";
import {Settings} from "../settings/settings.service";
import {createDefaultScenario} from "./scenario.data";

export interface Scenario {
    name: string,
    settings: Settings
}

/**
 * Applies and manages scenarios.
 */
export class ScenarioService {

    private scenarios: Scenario[];

    /* ngInject */
    constructor(private settingsService, private dataService) {
        this.scenarios = require("./scenarios.json");
    }

    /**
     * Applies a given scenario to the current codecharta session.
     * @param {Scenario} scenario
     */
    public applyScenario(scenario: Scenario) {
        this.settingsService.applySettings(scenario.settings);
    }

    /**
     * Returns an array of all scenarios.
     * @returns {Scenario[]} all scenarios
     */
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

    /**
     * Returns the default scenario.
     * @returns {Scenario} the scenario
     */
    public getDefaultScenario(): Scenario {
        return createDefaultScenario(this.settingsService.settings.map);
    }

}