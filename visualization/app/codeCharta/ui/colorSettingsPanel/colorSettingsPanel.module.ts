import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "../../state/state.module"
import { colorSettingsPanelComponent } from "./colorSettingsPanel.component"
import { ColorPickerForMapColorComponent } from "../colorPickerForMapColor/colorPickerForMapColor.component"
import { RangeSliderComponent } from "./rangeSlider/rangeSlider.component"

angular
	.module("app.codeCharta.ui.colorSettingsPanel", ["app.codeCharta.state"])
	.component(colorSettingsPanelComponent.selector, colorSettingsPanelComponent)
	.directive("ccColorPickerForMapColor", downgradeComponent({ component: ColorPickerForMapColorComponent }))
	.directive("ccRangeSlider", downgradeComponent({ component: RangeSliderComponent }))
