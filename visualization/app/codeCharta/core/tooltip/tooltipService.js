"use strict";
import {Tooltip} from "./model/tooltip.js";

/**
 *
 */
class TooltipService {

    /* @ngInject */

    /**
     * @constructor
     */
    constructor(){

        this.tooltips = {
            Statements: new Tooltip("Statements", "Number of Statements"),
            RLOC: new Tooltip("RLOC", "Real Lines of Code"),
            MCC: new Tooltip("MCC", "MacCabe Complexity or cyclomatic complexity"),
        };

    }

    getTooltipTextByKey(key) {
        return this.tooltips[key] ? this.tooltips[key].getTooltip() : "no description";
    }
    
}

export {TooltipService};
