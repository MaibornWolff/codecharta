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

    /* ngInject */
    constructor(private settingsService) {}

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
        return [this.getDefaultScenario()];
    }

    /**
     * Returns the default scenario.
     * @returns {Scenario} the scenario
     */
    public getDefaultScenario(): Scenario {
        return createDefaultScenario(this.settingsService.settings.map);
    }

}