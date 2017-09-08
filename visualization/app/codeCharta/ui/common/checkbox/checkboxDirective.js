"use strict";

/**
 * A simple checkbox customized for CodeCharta. Watches for model changes and calls the bound change-function
 */
class CheckboxDirective{

    /**
     * @constructor
     */
    constructor() {

        /** @type {string} */
        this.template = require("./checkbox.html");

        /** @type {string} */
        this.restrict = "E";

        /**
         *
         * Binds 'model' with '='.
         * Binds 'label' string with @ (one time only).
         * Binds 'change' function with '&'.
         *
         * @type {Scope}
         **/
        this.scope = {
            model: "=",
            label:"@",
            change:"&"
        };

    }

    /**
     * Watches model changes and links the change function to it.
     * @param {Scope} scope
     */
    link(scope){
        scope.$watch(
            ()=>{return scope.model;},
            ()=>{scope.change();}
        );
    }

}

export {CheckboxDirective};
