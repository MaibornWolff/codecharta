"use strict";

class ScenarioButtonsController {

    /* @ngInject */
    constructor(scenarioService) {


        /**
         *
         * @type {ScenarioService}
         */
        this.scenarioService = scenarioService;

        /**
         *
         * @type {string}
         */
        this.controllerAs = "ctrl";

        /**
         *
         * @type {boolean}
         */
        this.bindToController = true;

    }

}

export {ScenarioButtonsController};


