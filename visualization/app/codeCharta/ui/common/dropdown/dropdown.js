"use strict";

import {DropdownDirective} from "./dropdownDirective.js";

angular.module("app.codeCharta.ui.common.dropdown",[]);

angular.module("app.codeCharta.ui.common.dropdown").directive(
    "dropdownDirective",
    () => new DropdownDirective()
);
