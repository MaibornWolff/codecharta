import "../../core/core.module";
import angular from "angular";
import { heightSettingsPanelComponent } from "./heightSettingsPanel.component";

angular.module("app.codeCharta.ui.heightSettingsPanel", ["app.codeCharta.core"])
    .component(heightSettingsPanelComponent.selector, heightSettingsPanelComponent);


