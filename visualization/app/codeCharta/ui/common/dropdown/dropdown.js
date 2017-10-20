"use strict";

import "../../../core/tooltip/tooltip.module.ts";
import {DropdownDirective} from "./dropdownDirective.js";
import {DropdownController} from "./dropdownController.ts";

angular.module("app.codeCharta.ui.common.dropdown",["app.codeCharta.core.tooltip"]);

angular.module("app.codeCharta.ui.common.dropdown").directive(
    "dropdownDirective",
    () => new DropdownDirective()
);

angular.module("app.codeCharta.ui.common.dropdown").controller(
    "dropdownController",
    DropdownController
);
