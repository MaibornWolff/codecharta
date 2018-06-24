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
        this.settingsService.settings.margin = this.computeMargin();
        this.threeOrbitControlsService.autoFitTo();
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
     * Function that computes the margin applied to a scenario related the square root of the area divided
     * by the number of buildings
     */
    public  computeMargin(): number{

        let root: CodeMapNode = this.dataService._data.renderMap.root;
        let margin: number;

        // Previous parameters are wrapped to introduce them into goThroughMap() and make value changes
        // remain, with a pointer-like behaviour
        let numberOfBuildingsWrapped = {numberOfBuildings:0};
         let areaParametersWrapped = {areaMetricName: this.settingsService.settings.areaMetric, totalArea: 0};

        this.dataService.goThroughMap( root, this.countBuildings, numberOfBuildingsWrapped);
        this.dataService.goThroughMap( root, this.calculateTotalArea, areaParametersWrapped);

        margin = 4*Math.round(
            Math.sqrt(
                (areaParametersWrapped["totalArea"]/numberOfBuildingsWrapped["numberOfBuildings"])));

        console.log("buildings "+numberOfBuildingsWrapped["numberOfBuildings"]+" area "+
            areaParametersWrapped["areaMetricName"] +" "+areaParametersWrapped["totalArea"]+" margin "+margin);
        return margin;
    }

    /*
    * @param {CodeMapNode} map
    * @param {number[]} buildings ["numberOfBuildings"] the number of leaves( aka buildings) in map
    *
     */
    public countBuildings(map: CodeMapNode, buildings: number[]){
        if(!map.children){
            buildings["numberOfBuildings"]++;
        }
    }

    /**
     *
     * @param map
     * @param area ["areaMetricName"] name of the metric used for area in the map,
     *          ["totalArea"] aggregated value of the area
     */
    public calculateTotalArea(map: CodeMapNode, area: any[]){
        if(!map.children){
            area["totalArea"]+=map.attributes[area["areaMetricName"]];
        }
    }

    /**
     *
     * @param {CodeMapNode} map
     * @param {number[]} deep
     *
     * Function that called by goThroughMap() finds the deeper level of a map.
     */
    public findMapDeep(map:CodeMapNode,deep: number[]){
        if(map.children){
            deep["currentDeep"]++;
        }
        else{
            deep["maximalDeep"]=Math.max(deep["currentDeep"]+1,deep["maximalDeep"]);
            if(deep["currentDeep"]==342) console.log("deepName: "+map.path);
            deep["currentDeep"]=0;
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