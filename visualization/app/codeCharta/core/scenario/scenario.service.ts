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

    public applyScenario(scenario: Scenario) {
        const updatedSettingsUsingScenario = {...this.settingsService.settings, ...scenario.settings};
        this.settingsService.applySettings(updatedSettingsUsingScenario);
        if(scenario.autoFitCamera){
            let _this = this;
            setTimeout(function(){
                _this.threeOrbitControlsService.autoFitTo();
            },10);
        }
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
}