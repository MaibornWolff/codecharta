"use strict";

import {ScenarioButtonsDirective} from "./scenarioButtonsDirective.js";

angular.module("app.codeCharta.ui.scenarioButtons",["app.codeCharta.core.scenario"]);

angular.module("app.codeCharta.ui.scenarioButtons").directive(
    "scenarioButtonsDirective",
    () => new ScenarioButtonsDirective()
);
