"use strict";

import {IScope} from "angular";
import {TooltipService, TooltipServiceSubscriber, Tooltips} from "../../core/tooltip/tooltip.service";
import {ScenarioService, Scenario} from "../../core/scenario/scenario.service";
import {Settings, SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import {DataModel, DataService, DataServiceSubscriber} from "../../core/data/data.service";
import "./scenarioDropDown.component.scss";

export class ScenarioButtonsController implements TooltipServiceSubscriber, DataServiceSubscriber, SettingsServiceSubscriber {
    public  scenario: Scenario;

    private scenarios: Scenario[];
    private key;

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

    public updateScenarios() {
        this.scenarios = this.scenarioService.getScenarios();
    }

    public onDataChanged(data: DataModel, event: angular.IAngularEvent) {
        this.updateScenarios();
    }

    public onSettingsChanged(settings: Settings, event: Event) {
        this.updateScenarios();
    }

    public onTooltipsChanged(tooltips: Tooltips, event: Event) {
        this.$scope.$apply();
    }

    public getScenarioTooltipTextByKey(key: string) {
        return this.tooltipService.getTooltipTextByKey(key);
    }

    public onclick(value: Scenario) {
        this.scenarioService.applyScenario(value);
    }

    public applySettings(){
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



