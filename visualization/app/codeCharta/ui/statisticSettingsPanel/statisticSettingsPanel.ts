import "../rangeSlider/rangeSlider";
import "../../core/core.module";

import angular from "angular";

import {statisticSettingsPanelComponent} from "./statisticSettingsPanel.component";

angular.module("app.codeCharta.ui.statisticSettingsPanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
    .component(statisticSettingsPanelComponent.selector, statisticSettingsPanelComponent);


