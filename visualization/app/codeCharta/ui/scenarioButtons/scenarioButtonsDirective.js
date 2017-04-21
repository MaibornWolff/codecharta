"use strict";

import {ScenarioButtonsController} from "./scenarioButtonsController.js";

/**
 * Renders the scenario buttons
 */
class ScenarioButtonsDirective{

    /**
     * @constructor
     */
    constructor() {

        /**
         *
         * @type {string}
         */
        this.templateUrl = "./scenarioButtons.html";

        /**
         *
         * @type {string}
         */
        this.restrict = "E";

        /**
         *
         * @type {Scope}
         */
        this.scope = {};

        /**
         *
         * @type {ScenarioButtonsController}
         */
        this.controller = ScenarioButtonsController;

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

export {ScenarioButtonsDirective};
