import angular from "angular";

import "../../core/tooltip/tooltip.module.ts";
import {scenarioButtonsComponent} from "./scenarioButtonsComponent.ts";

angular.module("app.codeCharta.ui.scenarioButtons",["app.codeCharta.core.scenario", "app.codeCharta.core.tooltip"]);

angular.module("app.codeCharta.ui.scenarioButtons").component(
    scenarioButtonsComponent.selector,
    scenarioButtonsComponent
);
