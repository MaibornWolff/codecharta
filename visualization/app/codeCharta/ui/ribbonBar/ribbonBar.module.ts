import angular from "angular"
import { ribbonBarComponent } from "./ribbonBar.component"
import "../../state/state.module"
import "../colorSettingsPanel/colorSettingsPanel.module"
import { downgradeComponent } from "@angular/upgrade/static"
import { SearchPanelComponent } from "../searchPanel/searchPanel.component"
import { AreaSettingsPanelComponent } from "./areaSettingsPanel/areaSettingsPanel.component"
import { CustomConfigsComponent } from "../customConfigs/customConfigs.component"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel/heightSettingsPanel.component"
import { AreaMetricChooserComponent } from "./areaMetricChooser/areaMetricChooser.component"
import { NgModule } from "@angular/core"
import { AreaMetricChooserModule } from "./areaMetricChooser/areaMetricChooser.module"

angular.module("app.codeCharta.ui.ribbonBar", ["app.codeCharta.state"])

angular
	.module("app.codeCharta.ui.ribbonBar")
	.component(ribbonBarComponent.selector, ribbonBarComponent)
	.directive("ccSearchPanel", downgradeComponent({ component: SearchPanelComponent }))
	.directive("ccAreaSettingsPanel", downgradeComponent({ component: AreaSettingsPanelComponent }))
	.directive("ccCustomConfigs", downgradeComponent({ component: CustomConfigsComponent }))
	.directive("ccHeightSettingsPanel", downgradeComponent({ component: HeightSettingsPanelComponent }))
	.directive("ccAreaMetricChooser", downgradeComponent({ component: AreaMetricChooserComponent }))

@NgModule({
	imports: [AreaMetricChooserModule],
	entryComponents: [AreaMetricChooserComponent]
})
export class RibbonBarModule {}
