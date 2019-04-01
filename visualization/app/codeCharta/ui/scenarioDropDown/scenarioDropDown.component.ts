"use strict";

import "./scenarioDropDown.component.scss";
import {ScenarioHelper, Scenario} from "../../util/scenarioHelper";
import {SettingsService} from "../../state/settings.service";
import {MetricService, MetricServiceSubscriber} from "../../state/metric.service";
import {MetricData} from "../../codeCharta.model";
import {IRootScopeService} from "angular";
import {ThreeOrbitControlsService} from "../codeMap/threeViewer/threeOrbitControlsService";

export class ScenarioDropDownController implements MetricServiceSubscriber {

    private _viewModel: {
        scenarios: Scenario[],
        key: string
    } = {
        scenarios: null,
        key: null
    };

    constructor(
        private $rootScope: IRootScopeService,
        private settingsService: SettingsService,
        private threeOrbitControlsService: ThreeOrbitControlsService
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
        //TODO: array[STRING] ??
        this.settingsService.updateSettings(this._viewModel.scenarios[this._viewModel.key].settings);
        this._viewModel.key = null;
        this.threeOrbitControlsService.autoFitTo()
    }


}

export const scenarioDropDownComponent = {
    selector: "scenarioDropDownComponent",
    template: require("./scenarioDropDown.component.html"),
    controller: ScenarioDropDownController
};



