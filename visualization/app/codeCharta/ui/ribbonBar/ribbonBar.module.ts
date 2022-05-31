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
import { HeightMetricChooserModule } from "./heightMetricChooser/heightMetricChooser.module"
import { HeightMetricChooserComponent } from "./heightMetricChooser/areaMetricChooser.component"
import { ColorMetricChooserModule } from "./colorMetricChooser/heightMetricChooser.module"
import { ColorMetricChooserComponent } from "./colorMetricChooser/colorMetricChooser.component"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser/edgeMetricChooser.component"
import { EdgeMetricChooserModule } from "./edgeMetricChooser/edgeMetricChooser.module"

angular.module("app.codeCharta.ui.ribbonBar", ["app.codeCharta.state"])

angular
	.module("app.codeCharta.ui.ribbonBar")
	.component(ribbonBarComponent.selector, ribbonBarComponent)
	.directive("ccSearchPanel", downgradeComponent({ component: SearchPanelComponent }))
	.directive("ccAreaSettingsPanel", downgradeComponent({ component: AreaSettingsPanelComponent }))
	.directive("ccCustomConfigs", downgradeComponent({ component: CustomConfigsComponent }))
	.directive("ccHeightSettingsPanel", downgradeComponent({ component: HeightSettingsPanelComponent }))
	.directive("ccAreaMetricChooser", downgradeComponent({ component: AreaMetricChooserComponent }))
	.directive("ccHeightMetricChooser", downgradeComponent({ component: HeightMetricChooserComponent }))
	.directive("ccColorMetricChooser", downgradeComponent({ component: ColorMetricChooserComponent }))
	.directive("ccEdgeMetricChooser", downgradeComponent({ component: EdgeMetricChooserComponent }))

@NgModule({
	imports: [AreaMetricChooserModule, HeightMetricChooserModule, ColorMetricChooserModule, EdgeMetricChooserModule],
	entryComponents: [AreaMetricChooserComponent, HeightMetricChooserComponent, ColorMetricChooserComponent, EdgeMetricChooserComponent]
})
export class RibbonBarModule {}
