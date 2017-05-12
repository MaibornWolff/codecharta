"use strict";
import {Tooltip} from "./model/tooltip.js";

/**
 * Return tooltips containing descriptions
 */
class TooltipService {

    /* @ngInject */

    /**
     * @constructor
     */
    constructor(){

        /**
         * All available tooltips.
         * @type {{Statements: Tooltip, RLOC: Tooltip, MCC: Tooltip}}
         */
        this.tooltips = {
            Statements: new Tooltip("Statements", "Number of Statements"),
            RLOC: new Tooltip("RLOC", "Real Lines of Code"),
            MCC: new Tooltip("MCC", "MacCabe Complexity or cyclomatic complexity"),
        };

        this.scenarioTooltips = {
            Name1: new Tooltip("Name1", "Whatever description"),
            Name2: new Tooltip("Name2", "description2")
        };

    }

    /**
     * returns the tooltip description related to the given key
     * @param {String} key
     * @returns {string} description
     */
    getTooltipTextByKey(key) {
        return this.tooltips[key] ? this.tooltips[key].getTooltip() : "no description";
    }

    /**
     * returns the scenario description related to the given key
     * @param key
     * @returns {string}
     */
    getScenarioTooltipTextByKey(key) {
        return this.scenarioTooltips[key] ? this.scenarioTooltips[key].getTooltip() : "no description";
    }
    
}

export {TooltipService};
