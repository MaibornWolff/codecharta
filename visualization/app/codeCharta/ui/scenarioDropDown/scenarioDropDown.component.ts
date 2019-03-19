"use strict";

import "./scenarioDropDown.component.scss";
import {ScenarioHelper, Scenario} from "../../util/scenarioHelper";
import {SettingsService} from "../../state/settings.service";
import {MetricService, MetricServiceSubscriber} from "../../state/metric.service";
import {MetricData} from "../../codeCharta.model";
import {IRootScopeService} from "angular";

export class ScenarioDropDownController implements MetricServiceSubscriber {
    public  scenario: Scenario;

    private _viewModel: {
        scenarios: Scenario[],
        key: string
    } = {
        scenarios: null,
        key: null
    };

    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService
    ) {
        MetricService.subscribe(this.$rootScope, this)
    }

    public onMetricDataChanged(metricData: MetricData[], event: angular.IAngularEvent) {
        this.setScenarios(metricData);
    }

    private setScenarios(metricData: MetricData[]) {
        this._viewModel.scenarios = ScenarioHelper.getScenarios(metricData);
    }

    public applySettings(){
        this.settingsService.updateSettings(this._viewModel.scenarios[this._viewModel.key].settings);
        this._viewModel.key = null;
    }


}

export const scenarioDropDownComponent = {
    selector: "scenarioDropDownComponent",
    template: require("./scenarioDropDown.component.html"),
    controller: ScenarioDropDownController
};



