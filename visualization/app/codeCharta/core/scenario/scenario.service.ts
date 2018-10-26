"use strict";
import {Settings, SettingsService} from "../settings/settings.service";
import {createDefaultScenario} from "./scenario.data";
import {ThreeOrbitControlsService} from "../../ui/codeMap/threeViewer/threeOrbitControlsService";

export interface Scenario {
    name: string;
    settings: any;
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

    /**
     * Applies a given scenario to the current codecharta session.
     * @param {Scenario} scenario
     */
    public applyScenario(scenario: Scenario) {
        this.settingsService.applySettings(scenario.settings);
        if(scenario.autoFitCamera){
            let _this = this;
            setTimeout(function(){
                _this.threeOrbitControlsService.autoFitTo();
            },10);
        }
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
        return createDefaultScenario(this.settingsService.settings.map, this.settingsService.computeMargin());
    }

}