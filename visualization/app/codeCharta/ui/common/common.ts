import angular from "angular";

import {fabComponent} from "./fab.component.ts";
import {CheckboxDirective} from "./checkbox.directive.ts";
import {CollapsibleDirective} from "./collapsible.directive.js";
import {SliderDirective} from "./slider.directive.js";
import {NumberFieldDirective} from "./numberField.directive.js";
import {CollapsibleElementDirective} from "./collapsible.element.directive.js";
import {DropdownController} from "./dropdown.controller.ts";
import {DropdownDirective} from "./dropdown.directive.js";

import "../../core/tooltip/tooltip.module.ts";

angular.module("app.codeCharta.ui.common", ["app.codeCharta.core.tooltip"])
    .component(fabComponent.selector, fabComponent)
    .directive("checkboxDirective", () => new CheckboxDirective())
    .directive("collapsibleElementDirective", ($rootScope, $timeout) => new CollapsibleElementDirective($rootScope, $timeout))
    .directive("collapsibleDirective", () => new CollapsibleDirective())
    .directive("sliderDirective", () => new SliderDirective())
    .directive("numberFieldDirective", () => new NumberFieldDirective())
    .controller("dropdownController", DropdownController)
    .directive("dropdownDirective", () => new DropdownDirective() as any);
