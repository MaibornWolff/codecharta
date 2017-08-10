"use strict";

import {Scenario} from "./model/scenario.js";
import {Settings} from "../settings/model/settings.js";
import {Scale} from "../settings/model/scale.js";
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
        let defaultRange = new Range(20,40,false);
        let defaultSettings = new Settings(this.settingsService.settings.map, defaultRange, "rloc", "mcc", "mcc", true, false,1, new Scale(1,1,1), new Scale(0,300,1000));
        return new Scenario("rloc/mcc/mcc(20,40)", defaultSettings);
    }

}

export {ScenarioService};