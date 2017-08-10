"use strict";

import {LoadingPanelController} from "./loadingPanelController.js";
import {LoadingPanelDirective} from "./loadingPanelDirective.js";

angular.module("app.codeCharta.ui.loadingPanel",[]);

angular.module("app.codeCharta.ui.loadingPanel").controller(
    "loadingPanelController",
    LoadingPanelController
);

angular.module("app.codeCharta.ui.loadingPanel").directive(
    "loadingPanelDirective",
    () => new LoadingPanelDirective()
);

