"use strict";

import {LoadingPanelController} from "./loadingPanelController.js";

class LoadingPanelDirective {

    /**
     * @constructor
     */
    constructor() {
        /**
         *
         * @type {string}
         */
        this.templateUrl = "./loadingPanel.html";

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
         * @type {LoadingPanelController}
         */
        this.controller = LoadingPanelController;

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

export {LoadingPanelDirective};




