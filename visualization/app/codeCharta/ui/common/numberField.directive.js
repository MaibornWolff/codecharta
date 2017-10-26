"use strict";

/**
 * Renders a number field.
 */
class NumberFieldDirective {

    constructor() {
        /** @type {string} **/
        this.template = "<div class=\"input-field col s12\">\n" +
            "    <label for=\"numberField-directive-{{::$id}}\">{{::label}}</label>\n" +
            "    <br />\n" +
            "    <input id=\"numberField-directive-{{::$id}}\" type=\"number\" ng-model=\"model\" min={{::min}}>\n" +
            "</div>";

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

