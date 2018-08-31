"use strict";

import {IScope} from "angular";
import {TooltipService, TooltipServiceSubscriber, Tooltips} from "../../core/tooltip/tooltip.service";
import {ScenarioService, Scenario} from "../../core/scenario/scenario.service";
import $ from "jquery";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import "./scenarioDropDown.scss";

export class ScenarioButtonsController implements TooltipServiceSubscriber, DataServiceSubscriber, SettingsServiceSubscriber {

    private scenarios: Scenario[];
    private key;
    private visible: boolean = false;
    public  scenario: Scenario;
    /* @ngInject */
    /**
     *
     * @param {Scenario} scenarioService
     * @param {TooltipService} tooltipService
     * @param {Scope} $rootScope
     * @param {Scope} $scope
     */
    constructor(private scenarioService: ScenarioService,
                private tooltipService: TooltipService,
                private settingsService: SettingsService,
                private dataService: DataService,
                private $scope: IScope) {
        this.updateScenarios();
        this.tooltipService.subscribe(this);
        this.settingsService.subscribe(this);
        this.dataService.subscribe(this);
    }

    updateScenarios() {
        this.scenarios = this.scenarioService.getScenarios();
    }

    onDataChanged(data: DataModel, event: angular.IAngularEvent) {
        this.updateScenarios();
    }

    onSettingsChanged(settings: Settings, event: Event) {
        this.updateScenarios();
    }

    onTooltipsChanged(tooltips: Tooltips, event: Event) {
        this.$scope.$apply();
    }

    /**
     * returns the tooltip description related to the given key
     * @param {String} key
     * @returns {String} tooltip
     */
    getScenarioTooltipTextByKey(key: string) {
        return this.tooltipService.getTooltipTextByKey(key);
    }

    /**
     * called when a scenario button is clicked, applies the linked scenario
     * @param {Scenario} value
     */
    onclick(value: Scenario) {
        this.scenarioService.applyScenario(value);
        console.log(value);
    }

    applySettings(){
        this.scenarioService.applyScenario(this.scenarios[this.key]);
        this.key = null;
    }
}

export const scenarioButtonsComponent = {
    selector: "scenarioButtonsComponent",
    template: require("./scenarioButtons.html"),
    controller: ScenarioButtonsController
};
export const scenarioDropDownComponent = {
    selector: "scenarioDropDownComponent",
    template: require("./scenarioDropDown.html"),
    controller: ScenarioButtonsController
};



