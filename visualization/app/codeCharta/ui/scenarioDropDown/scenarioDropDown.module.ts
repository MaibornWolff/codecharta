import angular from "angular";
import {scenarioDropDownComponent} from "./scenarioDropDown.component";

angular.module("app.codeCharta.ui.scenarioDropDown",[])
.component(
    scenarioDropDownComponent.selector,
    scenarioDropDownComponent
);
