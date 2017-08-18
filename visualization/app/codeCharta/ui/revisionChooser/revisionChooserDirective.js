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

        /**
         * visibility
         * @type {boolean}
         */
        this.visible = false;
    }

    /**
     * Links the click Handler
     * @param {Scope} scope
     * @param {object} element dom element
     */
    link(scope, element) {
        element.find("#revisionButton").bind("click", this.toggle);
        element.find("#mapButton").bind("click", this.toggle);
    }

    /**
     * Toggles the visibility
     */
    toggle(){
        if (this.visible) {
            $("#revisionChooser").animate({left: -500 + "px"});
            this.visible = false;
        } else {
            $("#revisionChooser").animate({left: 2.8+"em"});
            this.visible = true;
        }
    }
    
}

export {RevisionChooserDirective};




