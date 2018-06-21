"use strict";
import {Settings, SettingsService} from "../settings/settings.service";
import {createDefaultScenario} from "./scenario.data";
import {ThreeOrbitControlsService} from "../../ui/codeMap/threeViewer/threeOrbitControlsService";
import {CodeMapNode} from "../data/model/CodeMap";

export interface Scenario {
    name: string;
    settings: Settings;
    autoFitCamera: boolean;
}

/**
 * Applies and manages scenarios.
 */
export class ScenarioService {

    private scenarios: Scenario[];

    /* ngInject */
    constructor(private settingsService: SettingsService,
                private dataService,
                private threeOrbitControlsService:ThreeOrbitControlsService) {
        this.scenarios = require("./scenarios.json");
        this.settingsService.subscribe(this);
    }

    public onSettingsChanged(){
        this.settingsService.settings["margin"] = this.computeMargin();
    }

    /**
     * Applies a given scenario to the current codecharta session.
     * @param {Scenario} scenario
     */
    public applyScenario(scenario: Scenario) {
        this.settingsService.applySettings(scenario.settings);
        if(scenario.autoFitCamera){
            this.threeOrbitControlsService.autoFitTo();
        }
    }

    /**
     * @returns {number}
     *
     * Function that computes the margin applied to a scenario depending of the
     * added rloc value of the whole map
     */
    public  computeMargin(): number{

        let areaMetricName = this.settingsService.settings.areaMetric;
        let accumulatedValue: number = 0;
        var parametersWrapped: any[] = [accumulatedValue, areaMetricName];

        this.dataService.goThroughMap((this.dataService._data.renderMap.root),this.addMetric,parametersWrapped);
        accumulatedValue = parametersWrapped[0];

        let logBase = 2;
        let margin: number = (isFinite(accumulatedValue)&&accumulatedValue>=1)?
            Math.round(
            Math.log(accumulatedValue)/Math.log(logBase)//Equivalent to logarithm with base logBase
        ):1;

        console.log(areaMetricName+accumulatedValue+", margin "+margin);
        return margin;
    }


    /**
     *
     * @param {CodeMapNode} map
     * @param {any[]} metric: [0]contains the accumulated value of a metric, [1] contains its name
     *
     * Function that adds the value of the given metric contained in every node its called.
     * It holds the value in an array in order to keep it from one call to another
     * from a function that goes through all the nodes of a tree.
     */
    public addMetric(map: CodeMapNode, metric: any[]){
        if(!map.children && //only the values of leaves are added
            map.attributes[metric[1]]){
            metric[0]+=map.attributes[metric[1]];
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
        return createDefaultScenario(this.settingsService.settings.map, this.computeMargin());
    }

}