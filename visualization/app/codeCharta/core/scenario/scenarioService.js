"use strict";

import {Scenario} from "./model/scenario.js";
import {Settings} from "../settings/model/settings.js";
import {Range} from "../settings/model/range.js";

/**
 * Applies and manages scenarios.
 */ 
class ScenarioService {

    /* ngInject */

    /**
     * @constructor 
     * @param {SettingsService} settingsService
     * @param {DataService} dataService
     */
    constructor(settingsService, dataService) {

        /**
         * @type {SettingsService}
         */
        this.settingsService = settingsService;

        /**
         * @type {DataService}
         */
        this.dataService = dataService;

    }

    /**
     * Applies a given scenario to the current codecharta session.
     * @param {Scenario} scenario
     */
    applyScenario(scenario) {
        this.settingsService.applySettings(scenario.settings);
    }

    /**
     * Returns an array of all scenarios.
     * @returns {Scenario[]} all scenarios
     */
    getScenarios() {
        return [this.getDefaultScenario()];
    }

    /**
     * Returns the default scenario.
     * @returns {Scenario} the scenario
     */
    getDefaultScenario() {
        let defaultRange = new Range(2,4,false);
        let defaultSettings = new Settings(this.settingsService.settings.map, defaultRange, "RLOC", "MCC", "MCC", false, false);
        return new Scenario("Default", defaultSettings);
    }

}

export {ScenarioService};