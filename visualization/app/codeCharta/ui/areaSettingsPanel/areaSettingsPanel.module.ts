import "../../core/core.module";
import angular from "angular";
import { areaSettingsPanelComponent } from "./areaSettingsPanel.component";

angular.module("app.codeCharta.ui.areaSettingsPanel", ["app.codeCharta.core"])
    .component(areaSettingsPanelComponent.selector, areaSettingsPanelComponent);


