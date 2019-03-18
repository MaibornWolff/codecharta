import angular from "angular";
import "../tooltip/tooltip.module";
import {scenarioButtonsComponent, scenarioDropDownComponent} from "./scenarioButtons.component";

angular.module("app.codeCharta.ui.scenarioButtons",["app.codeCharta.core.tooltip"])
.component(
    scenarioButtonsComponent.selector,
    scenarioButtonsComponent
).component(
    scenarioDropDownComponent.selector,
    scenarioDropDownComponent
);
