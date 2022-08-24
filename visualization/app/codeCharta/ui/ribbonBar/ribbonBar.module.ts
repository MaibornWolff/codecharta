import angular from "angular"
import { ribbonBarComponent } from "./ribbonBar.component"
import "../../state/state.module"
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
import { ColorSettingsPanelComponent } from "./colorSettingsPanel/colorSettingsPanel.component"
import { ShowScenariosButtonModule } from "./showScenariosButton/showScenariosButton.module"
import { ShowScenariosButtonComponent } from "./showScenariosButton/showScenariosButton.component"
import { EdgeSettingsPanelModule } from "./edgeSettingsPanel/edgeSettingsPanel.module"
import { EdgeSettingsPanelComponent } from "./edgeSettingsPanel/edgeSettingsPanel.component"
import { ArtificialIntelligenceModule } from "./artificialIntelligence/artificialIntelligence.module"
import { ArtificialIntelligenceComponent } from "./artificialIntelligence/artificialIntelligence.component"

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
	.directive("ccColorSettingsPanel", downgradeComponent({ component: ColorSettingsPanelComponent }))
	.directive("ccShowScenariosButton", downgradeComponent({ component: ShowScenariosButtonComponent }))
	.directive("ccEdgeSettingsPanel", downgradeComponent({ component: EdgeSettingsPanelComponent }))
	.directive("ccArtificialIntelligence", downgradeComponent({ component: ArtificialIntelligenceComponent }))

@NgModule({
	imports: [
		AreaMetricChooserModule,
		HeightMetricChooserModule,
		ColorMetricChooserModule,
		EdgeMetricChooserModule,
		ShowScenariosButtonModule,
		EdgeSettingsPanelModule,
		ArtificialIntelligenceModule
	],
	entryComponents: [
		AreaMetricChooserComponent,
		HeightMetricChooserComponent,
		ColorMetricChooserComponent,
		EdgeMetricChooserComponent,
		ShowScenariosButtonComponent,
		EdgeSettingsPanelComponent,
		ArtificialIntelligenceComponent
	]
})
export class RibbonBarModule {}
