"use strict";
import {DropdownController} from "./dropdownController.js";

/**
 * Renders a dropdown menu.
 */
class DropdownDirective{

    /**
     * @constructor
     */
    constructor() {

        /** @type {string} */
        this.templateUrl = "./dropdown.html";

        /** @type {string} */
        this.restrict = "E";

        /**
         * Binds 'label' string. Binds 'values' array with all possible values. Binds 'model' with the current selected value. Binds a 'change' function.
         * @type {Scope}
         **/
        this.scope = {
            label: "@",
            values: "=",
            model: "=",
            change: "&"
        };

        /**
         *
         * @type {DropdownController}
         */
        this.controller = DropdownController;

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

    /**
     * Links the change function to model changes.
     * @param {Scope} scope
     */
    link(scope){
        scope.$watch(
            ()=>{return scope.ctrl.model;},
            ()=>{scope.ctrl.change();}
        );
    }

}

export {DropdownDirective};
