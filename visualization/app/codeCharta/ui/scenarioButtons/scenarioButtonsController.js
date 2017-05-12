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

    getScenarioTooltipTextByKey(key){
        return this.tooltipService.getTooltipTextByKey(key);
    }

    onclick(value){
        this.scenarioService.applyScenario(value);
    }
}

export {ScenarioButtonsController};


