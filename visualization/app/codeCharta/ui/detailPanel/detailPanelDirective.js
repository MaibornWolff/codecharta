"use strict";

import {DetailPanelController} from "./detailPanelController.ts";

/**
 * Renders the detailPanel
 */
class DetailPanelDirective {

    /**
     * @constructor
     */
    constructor() {
        /**
         *
         * @type {string}
         */
        this.template = require("./detailPanel.html");

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
         * @type {DetailPanelController}
         */
        this.controller = DetailPanelController;

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

export {DetailPanelDirective};

