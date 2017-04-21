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
     * @param {Scope} $rootScope
     */
    constructor(settingsService, dataService, $rootScope) {

        /**
         * @type {SettingsService}
         */
        this.settingsService = settingsService;

        /**
         * @type {DataService}
         */
        this.dataService = dataService;

        /**
         * @type {Scope}
         */
        this.rootScope = $rootScope;

        let ctx = this;

    }

    /**
     * TODO Test
     * Applies a given scenario to the current codecharta session.
     * @param {Scenario} scenario
     */
    applyScenario(scenario) {
        console.log("button clicked");
        this.settingsService.applySettings(scenario.settings);
    }

    /**
     * TODO Tests
     * TODO default scenario only one time
     * Returns an array of all scenarios.
     * @returns {Scenario[]} all scenarios
     */
    getScenarios() {
        return [this.getDefaultScenario(), this.getDefaultScenario(), this.getDefaultScenario()];
    }

    /**
     * TODO Tests
     *
     * Returns the default scenario.
     * @returns {Scenario} the scenario
     */
    getDefaultScenario() {
        let defaultRange = new Range(2,4,false);
        let defaultSettings = new Settings(this.settingsService.settings.map, defaultRange, "Statements", "Average Complexity*", "Average Complexity*", false, false);
        return new Scenario("Default", defaultSettings);
    }



}

export {ScenarioService};