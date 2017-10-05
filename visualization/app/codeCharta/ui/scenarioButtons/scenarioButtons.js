"use strict";

import "../../core/tooltip/tooltip.ts";
import {ScenarioButtonsDirective} from "./scenarioButtonsDirective.js";
import {ScenarioButtonsController} from "./scenarioButtonsController.js";

angular.module("app.codeCharta.ui.scenarioButtons",["app.codeCharta.core.scenario", "app.codeCharta.core.tooltip"]);

angular.module("app.codeCharta.ui.scenarioButtons").directive(
    "scenarioButtonsDirective",
    () => new ScenarioButtonsDirective()
);

angular.module("app.codeCharta.ui.scenarioButtons").controller(
    "scenarioButtonsController",
    ScenarioButtonsController
);
