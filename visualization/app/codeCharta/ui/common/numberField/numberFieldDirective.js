"use strict";

/**
 * Renders a number field.
 */
class NumberFieldDirective {

    constructor() {
        /** @type {string} **/
        this.templateUrl = "./numberField.html";

        /** @type {string} **/
        this.restrict = "E";

        /**
         * Binds 'model', 'label', a minimal value 'min' and a 'change' function.
         * @type {Scope}
         **/
        this.scope = {
            model: "=",
            label: "@",
            min: "@",
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

export {NumberFieldDirective};

