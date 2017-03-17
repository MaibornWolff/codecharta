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
         * visibility flag
         * @type {boolean}
         */
        this.visible = false;
    }

    /**
     * Binds {@link RevisionChooserDirective#toggle} as click handler.
     * @param {Scope} scope
     * @param {object} element
     */
    link(scope, element) {
        element.bind("click", this.toggle);
    }

    /**
     * Toggles the Directives visibility.
     */
    toggle() {
        if (this.visible) {
            $("#revisionChooser").animate({left: -400 + "px"});
            this.visible = false;
        }
        else {
            $("#revisionChooser").animate({left: 2.8+"em"});
            this.visible = true;
        }
    }
    
}

export {RevisionChooserDirective};




