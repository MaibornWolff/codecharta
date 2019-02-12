"use strict";

import {IScope} from "angular";
import {TooltipService, TooltipServiceSubscriber, Tooltips} from "../../core/tooltip/tooltip.service";
import {ScenarioService, Scenario} from "../../core/scenario/scenario.service";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import "./scenarioDropDown.component.scss";

export class ScenarioButtonsController implements TooltipServiceSubscriber, DataServiceSubscriber, SettingsServiceSubscriber {

    private scenarios: Scenario[];
    private key;
    private visible: boolean = false;
    public  scenario: Scenario;

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

    getScenarioTooltipTextByKey(key: string) {
        return this.tooltipService.getTooltipTextByKey(key);
    }

    onclick(value: Scenario) {
        this.scenarioService.applyScenario(value);
    }

    applySettings(){
        this.scenarioService.applyScenario(this.scenarios[this.key]);
        this.key = null;
    }
}

export const scenarioButtonsComponent = {
    selector: "scenarioButtonsComponent",
    template: require("./scenarioButtons.component.html"),
    controller: ScenarioButtonsController
};
export const scenarioDropDownComponent = {
    selector: "scenarioDropDownComponent",
    template: require("./scenarioDropDown.component.html"),
    controller: ScenarioButtonsController
};



