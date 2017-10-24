import angular from "angular";
import {CheckboxDirective} from "./checkboxDirective.ts";

angular.module("app.codeCharta.ui.common.checkbox",[]);

angular.module("app.codeCharta.ui.common.checkbox").directive(
    "checkboxDirective",
    () => new CheckboxDirective()
);
