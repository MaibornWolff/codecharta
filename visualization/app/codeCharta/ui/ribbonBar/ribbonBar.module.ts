import angular from "angular"
import { ribbonBarComponent } from "./ribbonBar.component"
import "../../state/state.module"
import "../colorSettingsPanel/colorSettingsPanel.module"
import { downgradeComponent } from "@angular/upgrade/static"
import { SearchPanelComponent } from "../searchPanel/searchPanel.component"
import { CustomConfigsComponent } from "../customConfigs/customConfigs.component"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel/heightSettingsPanel.component"

angular.module("app.codeCharta.ui.ribbonBar", ["app.codeCharta.state"])

angular
	.module("app.codeCharta.ui.ribbonBar")
	.component(ribbonBarComponent.selector, ribbonBarComponent)
	.directive("ccSearchPanel", downgradeComponent({ component: SearchPanelComponent }))
	.directive("ccCustomConfigs", downgradeComponent({ component: CustomConfigsComponent }))
	.directive("ccHeightSettingsPanel", downgradeComponent({ component: HeightSettingsPanelComponent }))
