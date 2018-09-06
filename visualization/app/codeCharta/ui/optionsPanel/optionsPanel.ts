import "../rangeSlider/rangeSlider";
import "../statisticSettingsPanel/statisticSettingsPanel";
import "../aggregateSettingsPanel/aggregateSettingsPanel";
import "../../core/core.module";
import "../layoutSwitcher/layoutSwitcher";

import angular from "angular";

import {optionsPanelComponent} from "./optionsPanel.component";

angular.module("app.codeCharta.ui.optionsPanel", ["app.codeCharta.core"])
    .component(optionsPanelComponent.selector, optionsPanelComponent);


