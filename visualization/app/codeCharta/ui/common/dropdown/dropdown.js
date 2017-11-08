"use strict";

import "../../../core/tooltip/tooltip.js";
import {DropdownDirective} from "./dropdownDirective.js";
import {DropdownController} from "./dropdownController.js";

angular.module("app.codeCharta.ui.common.dropdown",["app.codeCharta.core.tooltip"]);

angular.module("app.codeCharta.ui.common.dropdown").directive(
    "dropdownDirective",
    () => new DropdownDirective()
);

angular.module("app.codeCharta.ui.common.dropdown").controller(
    "dropdownController",
    DropdownController
);

angular.module("app.codeCharta.ui.common.dropdown").filter('enumFilter', function () {
    return function (i) {
        return i.replace("_", " ").toLowerCase();
    };
});