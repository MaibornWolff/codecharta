"use strict";

/**
 * A simple checkbox customized for CodeCharta. Watches for model changes and calls the bound change-function
 */
class CheckboxDirective {

    private template: string = "<div class='input-field col s12'><input type='checkbox' ng-model='model' id='checkbox-directive-{{::$id}}'><label for='checkbox-directive-{{::$id}}'>{{::label}}</label></div>";
    private scope: any = {
        model: "=",
        label: "@",
        change: "&"
    };
    private restrict: string = "E";

    constructor() {}

    /**
     * Watches model changes and links the change function to it.
     */
    link(scope) {
        scope.$watch(
            ()=> {
                return scope.model;
            },
            ()=> {
                scope.change();
            }
        );
    }

}

export {CheckboxDirective};
