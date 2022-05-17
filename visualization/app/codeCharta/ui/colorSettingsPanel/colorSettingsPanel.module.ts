import angular from "angular"
import { downgradeComponent } from "@angular/upgrade/static"

import "../../state/state.module"
import { colorSettingsPanelComponent } from "./colorSettingsPanel.component"
import { ColorPickerForMapColorComponent } from "../colorPickerForMapColor/colorPickerForMapColor.component"
import { MetricColorRangeSliderComponent } from "./metricColorRangeSlider/metricColorRangeSlider.component"

angular
	.module("app.codeCharta.ui.colorSettingsPanel", ["app.codeCharta.state"])
	.component(colorSettingsPanelComponent.selector, colorSettingsPanelComponent)
	.directive("ccColorPickerForMapColor", downgradeComponent({ component: ColorPickerForMapColorComponent }))
	.directive("ccMetricColorRangeSlider", downgradeComponent({ component: MetricColorRangeSliderComponent }))
