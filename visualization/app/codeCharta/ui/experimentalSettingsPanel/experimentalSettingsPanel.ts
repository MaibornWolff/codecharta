import "../rangeSlider/rangeSlider";
import "../../core/core.module";

import angular from "angular";

import {experimentalSettingsPanelComponent} from "./experimentalSettingsPanel.component";

angular.module("app.codeCharta.ui.experimentalSettingsPanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
    .component(experimentalSettingsPanelComponent.selector, experimentalSettingsPanelComponent);


