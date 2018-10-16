import "../statisticSettingsPanel/statisticSettingsPanel";
import "../../core/core.module";
import "../layoutSwitcher/layoutSwitcher";

import angular from "angular";

import {experimentalSettingsPanelComponent} from "./experimentalSettingsPanel.component";

angular.module("app.codeCharta.ui.experimentalSettingsPanel", ["app.codeCharta.ui.statisticSettingsPanel", "app.codeCharta.core", "app.codeCharta.ui.layoutSwitcher"])
    .component(experimentalSettingsPanelComponent.selector, experimentalSettingsPanelComponent);


