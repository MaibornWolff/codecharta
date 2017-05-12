"use strict";

class ScenarioButtonsController {

    /* @ngInject */
    constructor(scenarioService, tooltipService) {


        /**
         *
         * @type {ScenarioService}
         */
        this.scenarioService = scenarioService;

        this.scenarios = scenarioService.getScenarios();

        this.tooltipService = tooltipService;
        
    }

    getScenarioTooltipTextByKey(key){
        return this.tooltipService.getScenarioTooltipTextByKey(key);
    }

    onclick(value){
        this.scenarioService.applyScenario(value);
    }
}

export {ScenarioButtonsController};


