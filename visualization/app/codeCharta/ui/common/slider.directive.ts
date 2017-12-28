/**
 * Renders a slider.
 */
import {IDirective} from "angular";

export class SliderDirective implements IDirective{

    template = "<div class=\"range-field col s12\">\n" +
        "    <label for=\"slider-directive-{{::$id}}\">{{::label}}</label>\n" +
        "    <br />\n" +
        "    <input id=\"slider-directive-{{::$id}}\" type=\"range\" ng-model=\"model\" min={{::min}} max={{::max}} step=\"{{::step}}\">\n" +
        "</div>";

    restrict = "E";

    scope = {
        model: "=",
        label: "@",
        min: "@",
        max: "@",
        step: "@",
        decimals: "@",
        change:"&"
    };

    constructor() {}

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
