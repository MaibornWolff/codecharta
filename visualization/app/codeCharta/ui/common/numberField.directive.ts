"use strict";
import {IDirective} from "angular";

/**
 * Renders a number field.
 */
export class NumberFieldDirective implements IDirective{

    template = "<div class=\"input-field col s12\">\n" +
        "    <label for=\"numberField-directive-{{::$id}}\">{{::label}}</label>\n" +
        "    <br />\n" +
        "    <input id=\"numberField-directive-{{::$id}}\" type=\"number\" ng-model=\"model\" min={{::min}}>\n" +
        "</div>";

    restrict = "E";

    /**
     * Binds 'model', 'label', a minimal value 'min' and a 'change' function.
     **/
    scope = {
        model: "=",
        label: "@",
        min: "@",
        change:"&"
    };

    constructor() {
    }

    /**
     * Links the change function to model changes.
     */
    link(scope){
        scope.$watch(
            ()=>{return scope.model;},
            ()=>{scope.change();}
        );
    }
    
}
