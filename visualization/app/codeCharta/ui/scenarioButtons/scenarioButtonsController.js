"use strict";

class ScenarioButtonsController {

    /* @ngInject */
    constructor(scenarioService, tooltipService, $rootScope, $scope) {


        /**
         *
         * @type {ScenarioService}
         */
        this.scenarioService = scenarioService;

        this.scenarios = scenarioService.getScenarios();

        this.tooltipService = tooltipService;

        let ctx = this;

        $rootScope.$on("tooltips-changed", (event,data) => {
            $scope.$apply();
        });
        
    }

    /**
     * returns the tooltip description related to the given key
     * @param key
     * @returns {string|*}
     */
    getScenarioTooltipTextByKey(key){
        return this.tooltipService.getTooltipTextByKey(key);
    }

    onclick(value){
        this.scenarioService.applyScenario(value);
    }
}

export {ScenarioButtonsController};


