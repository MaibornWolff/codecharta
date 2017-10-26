import angular from "angular";
import "./dropdown/dropdown.js";
import "./checkbox/checkbox.ts";
import "./numberField/numberField.js";
import "./collapsible/collapsible.js";
import "./collapsibleElement/collapsibleElement.js";
import "./slider/slider.js";

import {fabComponent} from "./fab.component.ts";

angular.module("app.codeCharta.ui.common", ["app.codeCharta.ui.common.dropdown", "app.codeCharta.ui.common.checkbox", "app.codeCharta.ui.common.numberField", "app.codeCharta.ui.common.collapsible", "app.codeCharta.ui.common.collapsibleElement", "app.codeCharta.ui.common.slider"])
    .component(fabComponent.selector, fabComponent);
