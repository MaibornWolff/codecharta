"use strict";

import "../common/fab/fab.js";
import {FabBarDirective} from "./fabBarDirective.js";

angular.module("app.codeCharta.ui.fabBar",["app.codeCharta.ui.common.fab"]);

angular.module("app.codeCharta.ui.fabBar").directive(
    "fabBarDirective",
    () => new FabBarDirective()
);
