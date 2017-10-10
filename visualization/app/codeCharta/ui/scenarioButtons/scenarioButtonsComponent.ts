"use strict";

import {IScope} from "angular";
import {TooltipService, TooltipServiceSubscriber, Tooltips} from "../../core/tooltip/tooltipService";
import {ScenarioService, Scenario} from "../../core/scenario/scenarioService";
import $ from "jquery";

export class ScenarioButtonsController implements TooltipServiceSubscriber{

    private scenarios: Scenario[];
    private visible: boolean = false;

    /* @ngInject */
    /**
     *
     * @param {Scenario} scenarioService
     * @param {TooltipService} tooltipService
     * @param {Scope} $rootScope
     * @param {Scope} $scope
     */
    constructor(
        private scenarioService: ScenarioService,
        private tooltipService: TooltipService,
        private $scope: IScope
    ) {
        this.scenarios = scenarioService.getScenarios();
        this.tooltipService.subscribe(this);
    }

    $postLink(){
        $("#revisionButton").bind("click", this.toggle);
        $("#mapButton").bind("click", this.toggle);
    }

    /**
     * Toggles the visibility
     */
    toggle(){
        if (this.visible) {
            $("#revisionChooser").animate({left: -500 + "px"});
            this.visible = false;
        } else {
            $("#revisionChooser").animate({left: 2.8+"em"});
            this.visible = true;
        }
    }

    onTooltipsChanged(tooltips: Tooltips, event: Event) {
        this.$scope.$apply();
    }

    /**
     * returns the tooltip description related to the given key
     * @param {String} key
     * @returns {String} tooltip
     */
    getScenarioTooltipTextByKey(key){
        return this.tooltipService.getTooltipTextByKey(key);
    }

    /**
     * called when a scenario button is clicked, applies the linked scenario
     * @param {Scenario} value
     */
    onclick(value){
        this.scenarioService.applyScenario(value);
    }
};

export const scenarioButtonsComponent = {
    selector: "scenarioButtonsComponent",
    template: require("./scenarioButtons.html"),
    controller: ScenarioButtonsController
};



