"use strict";

class ScenarioButtonsController {

    /* @ngInject */
    /**
     *
     * @param {Scenario} scenarioService
     * @param {TooltipService} tooltipService
     * @param {Scope} $rootScope
     * @param {Scope} $scope
     */
    constructor(scenarioService, tooltipService, $rootScope, $scope) {


        /**
         *
         * @type {ScenarioService}
         */
        this.scenarioService = scenarioService;

        /**
         *
         * @type {Scenario[]}
         */
        this.scenarios = scenarioService.getScenarios();

        /**
         *
         * @type {TooltipService}
         */
        this.tooltipService = tooltipService;

        let ctx = this;

        $rootScope.$on("tooltips-changed", (event,data) => {
            $scope.$apply();
        });
        
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
}

export {ScenarioButtonsController};


