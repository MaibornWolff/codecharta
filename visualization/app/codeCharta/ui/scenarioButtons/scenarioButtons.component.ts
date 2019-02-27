"use strict";

import {IAngularEvent, IRootScopeService, IScope} from "angular";
import {TooltipService, TooltipServiceSubscriber, Tooltips} from "../../core/tooltip/tooltip.service";
import {ScenarioService, Scenario} from "../../core/scenario/scenario.service";
import {SettingsService, SettingsServiceSubscriber} from "../../core/settings/settings.service";
import "./scenarioDropDown.component.scss";
import {Settings} from "../../codeCharta.model";

export class ScenarioButtonsController implements TooltipServiceSubscriber, SettingsServiceSubscriber {
    public  scenario: Scenario;

    private scenarios: Scenario[];
    private key;

    constructor(private $rootScope: IRootScopeService,
                private scenarioService: ScenarioService,
                private tooltipService: TooltipService,
                private settingsService: SettingsService,
                private $scope: IScope) {
        this.updateScenarios();
        this.tooltipService.subscribe(this);
        SettingsService.subscribe(this.$rootScope, this);
    }

    public updateScenarios() {
        this.scenarios = this.scenarioService.getScenarios();
    }

    public onSettingsChanged(settings: Settings, event: IAngularEvent) {
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



