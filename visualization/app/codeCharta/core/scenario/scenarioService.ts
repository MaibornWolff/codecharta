"use strict";
import {Range} from "../../model/Range.ts";
import {Scale} from "../../model/Scale.ts";
import {Settings} from "../settings/settingsService";

export interface Scenario {
    name: string,
    settings: Settings
}

/**
 * Applies and manages scenarios.
 */
export class ScenarioService {

    /* ngInject */
    constructor(private settingsService) {

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
        return [this.getDefaultScenario()];
    }

    /**
     * Returns the default scenario.
     * @returns {Scenario} the scenario
     */
    private getDefaultScenario(): Scenario {
        return {
            name: "rloc/mcc/mcc(20,40)",
            settings: this.getDefaultSettings()
        };
    }

    private getDefaultSettings(): Settings {

        let r: Range = {
            from: 20,
            to: 40,
            flipped: false
        };

        let s: Scale = {
            x: 1, y: 1, z: 1
        };

        let c: Scale = {
            x: 0, y: 300, z: 1000
        };

        return {
            map: this.settingsService.settings.map,
            neutralColorRange: r,
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            deltas: false,
            amountOfTopLabels: 1,
            scaling: s,
            camera: c,
            margin: 1
        };

    }

}