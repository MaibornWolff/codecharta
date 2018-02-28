import angular from "angular";

import {CheckboxDirective} from "./checkbox.directive";
import {CollapsibleDirective} from "./collapsible.directive";
import {SliderDirective} from "./slider.directive";
import {NumberFieldDirective} from "./numberField.directive";
import {CollapsibleElementDirective} from "./collapsible.element.directive";
import {DropdownController} from "./dropdown.controller";
import {DropdownDirective} from "./dropdown.directive";

import "../../core/tooltip/tooltip.module";

angular.module("app.codeCharta.ui.common", ["app.codeCharta.core.tooltip"])
    .directive("checkboxDirective", () => new CheckboxDirective())
    .directive("collapsibleElementDirective", ($rootScope, $timeout) => new CollapsibleElementDirective($rootScope, $timeout))
    .directive("collapsibleDirective", () => new CollapsibleDirective())
    .directive("sliderDirective", () => new SliderDirective())
    .directive("numberFieldDirective", () => new NumberFieldDirective())
    .controller("dropdownController", DropdownController)
    .directive("dropdownDirective", () => new DropdownDirective() as any);
