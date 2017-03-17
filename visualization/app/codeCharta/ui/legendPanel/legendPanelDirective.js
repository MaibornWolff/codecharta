"use strict";

import {LegendPanelController} from "./legendPanelController";

/**
 * Renders the legend panel
 */
class LegendPanelDirective{

    /**
     * @constructor
     */
    constructor() {

        /**
         *
         * @type {string}
         */
        this.templateUrl = "./legendPanel.html";

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
         * @type {LegendPanelController}
         */
        this.controller = LegendPanelController;

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
        element.find("#legendButton").bind("click", this.toggle);
    }

    /**
     * Toggles the visibility
     */
    toggle(){
        if (this.visible) {
            $("#legendPanel").animate({left: -500 + "px"});
            this.visible = false;
        } else {
            $("#legendPanel").animate({left: 2.8+"em"});
            this.visible = true;
        }
    }
    
}

export {LegendPanelDirective};
