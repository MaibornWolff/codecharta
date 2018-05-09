import "../rangeSlider/rangeSlider";
import "../../core/core.module";
import angular from "angular";
import { aggregateSettingsPanelComponent } from "./aggregateSettingsPanel.component";
angular.module("app.codeCharta.ui.aggregateSettingsPanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
    .component(aggregateSettingsPanelComponent.selector, aggregateSettingsPanelComponent);
//# sourceMappingURL=aggregateSettingsPanel.js.map