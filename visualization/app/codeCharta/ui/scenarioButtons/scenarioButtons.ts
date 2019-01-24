import angular from "angular";
import "../../core/scenario/scenario.module";
import "../../core/tooltip/tooltip.module";
import {scenarioButtonsComponent, scenarioDropDownComponent} from "./scenarioButtons.component";

angular.module("app.codeCharta.ui.scenarioButtons",["app.codeCharta.core.scenario", "app.codeCharta.core.tooltip"])
.component(
    scenarioButtonsComponent.selector,
    scenarioButtonsComponent
).component(
    scenarioDropDownComponent.selector,
    scenarioDropDownComponent
);
