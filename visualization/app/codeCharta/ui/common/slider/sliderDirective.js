"use strict";

/**
 * Renders a slider.
 */
class SliderDirective {

    /**
     * @constuctor
     */
    constructor() {
        /** @type {string} **/
        this.templateUrl = "./slider.html";

        /** @type {string} **/
        this.restrict = "E";

        /**
         * Binds model, label, min, max, step, decimals and a change function.
         * @type {Scope}
         **/
        this.scope = {
            model: "=",
            label: "@",
            min: "@",
            max: "@",
            step: "@",
            decimals: "@",
            change:"&"
        };
    }

    /**
     * Links the change function to model changes.
     * @param {Scope} scope
     */
    link(scope){

        scope.$watch(
            ()=>{return scope.model;},
            ()=>{scope.change();}
        );

    }
    
}

export {SliderDirective};

