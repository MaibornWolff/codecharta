import "../../state/state.module"
import angular from "angular"
import { edgeSettingsPanelComponent } from "./edgeSettingsPanel.component"
import { downgradeComponent } from "@angular/upgrade/static"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle/edgeMetricToggle.component"

angular
	.module("app.codeCharta.ui.edgeSettingsPanel", ["app.codeCharta.state"])
	.component(edgeSettingsPanelComponent.selector, edgeSettingsPanelComponent)
	.directive("ccEdgeMetricToggle", downgradeComponent({ component: EdgeMetricToggleComponent }))
