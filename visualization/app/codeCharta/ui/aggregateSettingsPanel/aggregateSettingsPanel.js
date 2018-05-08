import "../rangeSlider/rangeSlider";
import "../../core/core.module";
import angular from "angular";
import { aggregateSettingsPanelComponent } from "./aggregateSettingsPanel.component.ts";
angular.module("app.codeCharta.ui.aggregateSettingsPanel", ["app.codeCharta.ui.rangeSlider", "app.codeCharta.core"])
    .component(aggregateSettingsPanelComponent.selector, aggregatettingsPanelComponent);
//# sourceMappingURL=aggregateSettingsPanel.js.map