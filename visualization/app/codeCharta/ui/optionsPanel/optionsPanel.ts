import "../../core/core.module";

import angular from "angular";

import {optionsPanelComponent} from "./optionsPanel.component";

angular.module("app.codeCharta.ui.optionsPanel", ["app.codeCharta.core"])
    .component(optionsPanelComponent.selector, optionsPanelComponent);


