/**
 * Renders a slider.
 */
import {IDirective} from "angular";

export class SliderDirective implements IDirective {

    template = "<label for=\"slider-directive-wrapper-{{::$id}}\">{{::label}}</label>\n" +
        "<div id=\"slider-directive-wrapper-{{::$id}}\">" +
        "<div class=\"range-field col s6\">\n" +
        "<br />\n" +
        "<input id=\"slider-directive-{{::$id}}\" type=\"range\" ng-model=\"model\" min={{::min}} max={{::max}} step=\"{{::step}}\">\n" +
        "</div>" +
        "<div class='input-field col s6'>" +
        "<input type='number' ng-model=\"model\" min={{::min}} max={{::max}} step=\"{{::step}}\">" +
        "</div>" +
        "</div>";

    restrict = "E";

    scope = {
        model: "=",
        label: "@",
        min: "@",
        max: "@",
        step: "@",
        decimals: "@",
        textbox: "@",
        change: "&"
    };

    constructor() {
    }

    /**
     * Links the change function to model changes.
     * @param {Scope} scope
     */
    link(scope) {

        scope.$watch(
            () => {
                return scope.model;
            },
            () => {
                scope.change();
            }
        );

    }

}
