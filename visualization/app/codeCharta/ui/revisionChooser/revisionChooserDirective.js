"use strict";

import {RevisionChooserController} from "./revisionChooserController.js";

/**
 * Renders the RevisionChooser
 */
class RevisionChooserDirective {

    /**
     * @constructor
     */
    constructor() {
        /**
         *
         * @type {string}
         */
        this.templateUrl = "./revisionChooser.html";

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
         * @type {RevisionChooserController}
         */
        this.controller = RevisionChooserController;

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

export {RevisionChooserDirective};




