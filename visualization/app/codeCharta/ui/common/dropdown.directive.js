"use strict";
import {DropdownController} from "./dropdown.controller.ts";

/**
 * Renders a dropdown menu.
 */
class DropdownDirective{

    /**
     * @constructor
     */
    constructor() {

        /** @type {string} */
        this.template = "<div class=\"input-field col s12\">\n" +
            "    <label for=\"dropdown-directive-{{::$id}}\">{{::ctrl.label}}</label>\n" +
            "    <br />\n" +
            "    <select class=\"browser-default\" ng-model=\"ctrl.model\" id=\"dropdown-directive-{{::$id}}\">\n" +
            "        <option title=\"{{ctrl.getTooltipTextByKey(x);}}\" ng-repeat=\"x in ctrl.values\" value=\"{{x}}\">{{x}}</option>\n" +
            "    </select>\n" +
            "</div>";

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
