"use strict";

import {NumberFieldDirective} from "./numberFieldDirective.js";

angular.module("app.codeCharta.ui.common.numberField",[]);

angular.module("app.codeCharta.ui.common.numberField").directive(
    "numberFieldDirective",
    () => new NumberFieldDirective()
);
