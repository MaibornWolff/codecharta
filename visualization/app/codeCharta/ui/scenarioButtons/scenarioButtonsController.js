"use strict";

class ScenarioButtonsController {

    /* @ngInject */
    /**
     *
     * @param {} scenarioService
     * @param {} tooltipService
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
         * @type {}
         */
        this.tooltipService = tooltipService;

        let ctx = this;

        $rootScope.$on("tooltips-changed", (event,data) => {
            $scope.$apply();
        });
        
    }

    /**
     * returns the tooltip description related to the given key
     * @param {} key
     * @returns {string}
     */
    getScenarioTooltipTextByKey(key){
        return this.tooltipService.getTooltipTextByKey(key);
    }

    onclick(value){
        this.scenarioService.applyScenario(value);
    }
}

export {ScenarioButtonsController};


