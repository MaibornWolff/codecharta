"use strict";

import {CheckboxDirective} from "./checkboxDirective.js";

angular.module("app.codeCharta.ui.common.checkbox",[]);

angular.module("app.codeCharta.ui.common.checkbox").directive(
    "checkboxDirective",
    () => new CheckboxDirective()
);
