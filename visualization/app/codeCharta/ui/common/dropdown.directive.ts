import {DropdownController} from "./dropdown.controller";
import {IDirective} from "angular";

/**
 * Renders a dropdown menu.
 */
export class DropdownDirective implements IDirective{

    template = "<div class=\"input-field col s12\">\n" +
        "    <label for=\"dropdown-directive-{{::$id}}\">{{::ctrl.label}}</label>\n" +
        "    <br />\n" +
        "    <select title=\"{{ctrl.getTooltipTextByKey(ctrl.model);}}\" class=\"browser-default\" ng-model=\"ctrl.model\" id=\"dropdown-directive-{{::$id}}\">\n" +
        "        <option ng-if=\"ctrl.useEnumFilter\" title=\"{{ctrl.getTooltipTextByKey(x);}}\" ng-repeat=\"x in ctrl.values\" value=\"{{x}}\">{{ctrl.toLowerCaseButFirst(x)}}</option>\n" +
        "        <option ng-if=\"!ctrl.useEnumFilter\" title=\"{{ctrl.getTooltipTextByKey(x);}}\" ng-repeat=\"x in ctrl.values\" value=\"{{x}}\">{{x}}</option>\n" +
        "    </select>\n" +
        "</div>";

    restrict = "E";

    scope = {
        label: "@",
        values: "=",
        model: "=",
        change: "&",
        useEnumFilter: "@"
    };


controller = DropdownController;
    controllerAs = "ctrl";
    bindToController = true;


    constructor() {}

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